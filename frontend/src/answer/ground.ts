import type { AIAnswer, AnswerStatus, AskRequest, Citation, Document } from '../types'
import type { ModelAnswer } from './schema'

const STATUSES: AnswerStatus[] = ['answered', 'insufficient_evidence', 'no_evidence', 'needs_clarification']
const str = (v: unknown) => (typeof v === 'string' && v.trim() ? v.trim() : undefined)

export const UNSUPPORTED_ANSWER =
  'An answer was generated, but it could not be tied to any passage in the selected records, so it is not shown.'

/** Light shape check. Structured outputs should guarantee this, but never trust it blindly. */
export function parseModelAnswer(raw: unknown): ModelAnswer | null {
  const o = raw as Partial<ModelAnswer> | null
  if (!o || typeof o !== 'object' || !STATUSES.includes(o.status as AnswerStatus) || !Array.isArray(o.citations)) return null
  return {
    status: o.status as AnswerStatus,
    answer: typeof o.answer === 'string' ? o.answer : '',
    citations: o.citations.filter((c) => c && typeof c.sourceId === 'string' && typeof c.passageId === 'string'),
    missingInfo: str(o.missingInfo) ?? null,
    clarifyingQuestion: str(o.clarifyingQuestion) ?? null,
    suggestedQuestions: Array.isArray(o.suggestedQuestions) ? o.suggestedQuestions.filter((q) => typeof q === 'string' && q.trim()) : [],
  }
}

/**
 * Turn the model's answer into an AIAnswer the answer card can trust:
 * - keep only citations that resolve to a passage in the searched (in-scope) sources
 * - copy the excerpt, locator, and emissions label from the record, not from the model
 * - downgrade the status when cited evidence is missing or invalid
 */
export function groundAnswer(model: ModelAnswer, inScope: Document[], req: AskRequest): AIAnswer {
  const base = { question: req.question, scope: req.scope, isSample: false }

  if (model.status === 'needs_clarification') {
    return {
      ...base,
      status: 'needs_clarification',
      answer: '',
      citations: [],
      clarifyingQuestion: model.clarifyingQuestion ?? 'Could you say more about what you want to know from these records?',
      suggestedQuestions: model.suggestedQuestions.slice(0, 3),
      ...(model.missingInfo ? { missingInfo: model.missingInfo } : {}),
    }
  }

  if (model.status === 'no_evidence') {
    return { ...base, status: 'no_evidence', answer: '', citations: [], missingInfo: model.missingInfo ?? 'The selected records do not address this question.' }
  }

  const citations: Citation[] = []
  const seen = new Set<string>()
  let invalid = 0
  for (const c of model.citations) {
    const key = `${c.sourceId}/${c.passageId}`
    if (seen.has(key)) continue
    seen.add(key)
    const passage = inScope.find((s) => s.id === c.sourceId)?.passages.find((p) => p.id === c.passageId)
    if (!passage) {
      invalid++
      continue
    }
    citations.push({
      sourceId: c.sourceId,
      passageId: c.passageId,
      excerpt: passage.text,
      locator: passage.locator,
      ...(passage.emissionsKind ? { emissionsKind: passage.emissionsKind } : {}),
    })
  }

  if (citations.length === 0 || !model.answer.trim()) {
    return { ...base, status: 'no_evidence', answer: '', citations: [], missingInfo: model.missingInfo ?? UNSUPPORTED_ANSWER }
  }

  // An answer that leaned on a citation we could not verify is only partly supported.
  const status: AnswerStatus = invalid > 0 ? 'insufficient_evidence' : model.status
  const missingInfo =
    invalid > 0
      ? [model.missingInfo, `${invalid} cited passage(s) could not be matched to the selected records and were removed.`].filter(Boolean).join(' ')
      : model.missingInfo

  return { ...base, status, answer: model.answer.trim(), citations, ...(missingInfo ? { missingInfo } : {}) }
}
