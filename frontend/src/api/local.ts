import pal50 from '../../../data/permits/exxonmobil-beaumont-pal50-renewal.json'
import chickadee from '../../../data/permits/g3-chickadee-beaumont-124670-renewal.json'
import hoimyung from '../../../data/permits/hoimyung-beaumont-182843-new.json'
import arkema from '../../../data/permits/arkema-beaumont-o1636-renewal.json'
import type { AIAnswer, AskRequest, Citation, Permit } from '../types'

// Consume the shared JSON without keeping a second copy of the record.
export const localPermits: Permit[] = [pal50, chickadee, hoimyung, arkema] as Permit[]
export const DEMO_QUESTION = 'Would this renewal let the refinery emit more nitrogen oxides?'

const normalize = (s: string) => s.trim().toLowerCase().replace(/[?.!]+$/, '')

/** A single labeled sample, not a retrieval service or a general question matcher. */
export function localAnswer(permit: Permit, req: AskRequest): AIAnswer {
  const base = { question: req.question, scope: req.scope, isSample: true }
  if (permit.id !== pal50.id) {
    return {
      question: req.question, scope: req.scope, status: 'no_evidence', answer: '', citations: [],
      missingInfo: 'Only an official-notice summary is loaded for this case. No sample answer or document search is available. Open the original notice for details.',
    }
  }
  if (normalize(req.question) !== normalize(DEMO_QUESTION)) {
    return {
      ...base, status: 'needs_clarification', answer: '', citations: [],
      clarifyingQuestion: 'This preview only includes the sample question below. General document search is not connected yet. Would you like to try the sample?',
      suggestedQuestions: [DEMO_QUESTION],
    }
  }
  if (req.scope === 'facility_history') {
    return {
      ...base, status: 'insufficient_evidence',
      answer: 'The historical facility records do not establish what this renewal would authorize. Include the permit documents to compare the existing and proposed limits.',
      citations: [], missingInfo: 'Select “This permit” or “Both” to include the technical review.',
    }
  }
  const cite = (sourceId: string, passageId: string, emissionsKind?: Citation['emissionsKind']): Citation => {
    const passage = permit.sources.find(s => s.id === sourceId)?.passages.find(p => p.id === passageId)
    if (!passage) throw new Error(`Missing sample evidence: ${sourceId}/${passageId}`)
    return { sourceId, passageId, excerpt: passage.text, locator: passage.locator, ...(emissionsKind ? { emissionsKind } : {}) }
  }
  return {
    ...base, status: 'answered',
    answer: 'This renewal does not raise the existing NOx cap. The technical review lists both the existing and proposed NOx limits as 2,088.19 tons per year. This compares permitted limits; it does not establish that actual emissions cannot rise within the cap. TCEQ issued the renewal on March 31, 2026.',
    citations: [cite('src-technical', 't1'), cite('src-technical', 't2', 'proposed_limit'), cite('src-technical', 't3'), cite('src-final-action', 'f1')],
    missingInfo: 'These excerpts do not project future actual emissions.',
  }
}
