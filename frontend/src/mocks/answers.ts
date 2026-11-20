/**
 * MOCK AI ANSWERS — stands in for Component 3 (retrieval & QA) during development.
 * This is NOT a RAG pipeline. It returns one prewritten sample answer for the demo
 * question and a naive keyword match otherwise. Every answer is flagged isSample.
 */
import type { AIAnswer, AskRequest, Citation, Permit, SearchScope } from '../types'

export type MockScenario =
  | 'auto'
  | 'slow'
  | 'error'
  | 'no_evidence'
  | 'insufficient_evidence'
  | 'needs_clarification'

export const MOCK_SCENARIOS: { value: MockScenario; label: string }[] = [
  { value: 'auto', label: 'Auto (respond to the question)' },
  { value: 'slow', label: 'Slow response (6s loading)' },
  { value: 'error', label: 'Request fails' },
  { value: 'no_evidence', label: 'No evidence found' },
  { value: 'insufficient_evidence', label: 'Insufficient evidence' },
  { value: 'needs_clarification', label: 'Needs clarification' },
]

const inScope = (permit: Permit, sourceId: string, scope: SearchScope) => {
  const source = permit.sources.find((s) => s.id === sourceId)
  return !!source && (scope === 'both' || source.scope === scope)
}

/** Build a citation that quotes a stored passage verbatim. */
function cite(permit: Permit, sourceId: string, passageId: string, extra?: Partial<Citation>): Citation | null {
  const passage = permit.sources.find((s) => s.id === sourceId)?.passages.find((p) => p.id === passageId)
  if (!passage) return null
  return { sourceId, passageId, excerpt: passage.text, locator: passage.locator, ...extra }
}

const isNoxQuestion = (q: string) => /\b(nox|nitrogen ox)/i.test(q)

const isAmbiguous = (q: string) => {
  const words = q.trim().split(/\s+/).filter(Boolean)
  return words.length < 3 || /^(is (it|this) (bad|safe|ok|okay)|what about (it|this)|tell me more)\??$/i.test(q.trim())
}

function noxAnswer(permit: Permit, req: AskRequest): AIAnswer {
  const limit = cite(permit, 'src-technical', 't1', { emissionsKind: 'proposed_limit' })
  const limitNote = cite(permit, 'src-technical', 't3')
  const notice = cite(permit, 'src-notice', 'n1')
  const reported = cite(permit, 'src-history', 'h1', { emissionsKind: 'reported' })
  const base = { question: req.question, scope: req.scope, isSample: true }

  if (req.scope === 'facility_history') {
    return {
      ...base,
      status: 'insufficient_evidence',
      answer:
        'Facility history shows reported NOx emissions from Heaters H-1 and H-2 of 96.4–101.9 tons per year (2023–2025). It does not contain the proposed permit limits, so it cannot show whether the renewal would allow more NOx.',
      citations: [reported].filter((c): c is Citation => !!c),
      missingInfo: 'Proposed emission limits are in the permit documents. Search "This permit" or "Both" to include them.',
    }
  }

  if (req.scope === 'permit') {
    return {
      ...base,
      status: 'answered',
      answer:
        'Yes. The draft permit would raise the maximum allowable NOx limit for Heaters H-1 and H-2 combined from 118.5 to 142.0 tons per year. This is a proposed limit, not a measurement of actual emissions.',
      citations: [limit, notice, limitNote].filter((c): c is Citation => !!c),
      missingInfo: 'Reported (actual) emissions are in the facility history, which was not searched.',
    }
  }

  return {
    ...base,
    status: 'answered',
    answer:
      'Yes, on paper. The draft permit would raise the proposed maximum allowable NOx limit for Heaters H-1 and H-2 from 118.5 to 142.0 tons per year. Separately, the facility’s reported NOx emissions from those heaters were 96.4–101.9 tons per year in 2023–2025, already below the current limit. The records do not estimate how much actual emissions would change.',
    citations: [limit, reported, notice, limitNote].filter((c): c is Citation => !!c),
    missingInfo: 'No document in this case projects future actual emissions after the change.',
  }
}

const STOPWORDS = new Set(
  'the a an and or of to in on for is are was were be this that it its with from by at as what when where who why how does do did would will can could should their there they them about any permit facility'.split(' '),
)

/** Naive keyword match over passages in scope — clearly labeled as a mock fallback. */
function keywordAnswer(permit: Permit, req: AskRequest): AIAnswer {
  const terms = req.question
    .toLowerCase()
    .split(/[^a-z0-9-]+/)
    .filter((w) => w.length > 2 && !STOPWORDS.has(w))

  const citations: Citation[] = []
  for (const source of permit.sources) {
    if (!inScope(permit, source.id, req.scope)) continue
    for (const p of source.passages) {
      const words = p.text.toLowerCase().split(/[^a-z0-9-]+/)
      // match whole words or word prefixes ("emission" → "emissions"), not fragments ("art" → "part")
      if (terms.some((t) => words.some((w) => w.startsWith(t)))) {
        citations.push({ sourceId: source.id, passageId: p.id, excerpt: p.text, locator: p.locator })
      }
    }
  }

  const base = { question: req.question, scope: req.scope, isSample: true }
  if (citations.length === 0) {
    return {
      ...base,
      status: 'no_evidence',
      answer: '',
      citations: [],
      missingInfo:
        req.scope === 'both'
          ? 'None of the loaded documents mention the terms in your question.'
          : 'None of the selected documents mention the terms in your question. Try searching "Both".',
    }
  }
  return {
    ...base,
    status: 'insufficient_evidence',
    answer:
      'Mock mode has no written answer for this question. The passages below mention terms from your question — read them directly to decide whether they answer it.',
    citations: citations.slice(0, 4),
    missingInfo: 'A real answer will come from the AI retrieval service (Component 3).',
  }
}

export function mockAnswer(permit: Permit, req: AskRequest, scenario: MockScenario): AIAnswer {
  const base = { question: req.question, scope: req.scope, isSample: true }

  switch (scenario) {
    case 'no_evidence':
      return { ...base, status: 'no_evidence', answer: '', citations: [], missingInfo: 'Forced empty state (demo control).' }
    case 'needs_clarification':
      return clarification(req)
    case 'insufficient_evidence': {
      const c = cite(permit, 'src-history', 'h1', { emissionsKind: 'reported' })
      return {
        ...base,
        status: 'insufficient_evidence',
        answer: 'The loaded records only partly address this question.',
        citations: c ? [c] : [],
        missingInfo: 'Forced insufficient-evidence state (demo control).',
      }
    }
  }

  if (isAmbiguous(req.question)) return clarification(req)
  if (isNoxQuestion(req.question) && permit.id === 'mock-refinery-renewal') return noxAnswer(permit, req)
  return keywordAnswer(permit, req)
}

function clarification(req: AskRequest): AIAnswer {
  return {
    question: req.question,
    scope: req.scope,
    isSample: true,
    status: 'needs_clarification',
    answer: '',
    citations: [],
    clarifyingQuestion: 'Can you say which part of the permit you mean — emissions, the comment process, or the facility’s record?',
    suggestedQuestions: [
      'Would this renewal let the refinery emit more nitrogen oxides?',
      'How do I submit a public comment and by when?',
      'Has this facility reported emissions events before?',
    ],
  }
}
