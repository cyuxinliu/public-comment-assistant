import type { AIAnswer, AskRequest, Permit } from '../types'
import { groundAnswer, parseModelAnswer } from './ground'
import { buildUserMessage, SYSTEM_PROMPT } from './prompt'
import { retrieve } from './retrieve'

export interface ModelPrompt {
  system: string
  user: string
}

/** Sends a prompt to a model and returns its parsed JSON. Swappable: browser key, backend, or a test fake. */
export type CallModel = (prompt: ModelPrompt, signal?: AbortSignal) => Promise<unknown>

export class AnswerFormatError extends Error {
  constructor() {
    super('The answer came back in an unexpected format. Please try again.')
    this.name = 'AnswerFormatError'
  }
}

/** Component 3: retrieve passages for the scope, ask the model, and ground its answer in the record. */
export async function answerQuestion(permit: Permit, req: AskRequest, callModel: CallModel, signal?: AbortSignal): Promise<AIAnswer> {
  const base = { question: req.question, scope: req.scope, isSample: false }

  if (!req.question.trim()) {
    return { ...base, status: 'needs_clarification', answer: '', citations: [], clarifyingQuestion: 'What would you like to know about this permit?' }
  }

  const sources = retrieve(permit, req.scope)
  if (sources.length === 0) {
    const other = req.scope === 'permit' ? 'facility_history' : req.scope === 'facility_history' ? 'permit' : null
    const otherLoaded = other && permit.sources.some((s) => s.scope === other && s.passages.length > 0)
    return {
      ...base,
      status: 'no_evidence',
      answer: '',
      citations: [],
      missingInfo: otherLoaded
        ? `No ${req.scope === 'permit' ? 'permit documents' : 'facility history records'} are loaded for this case. Try “Both” to include the other records.`
        : 'No documents are loaded for this case yet.',
    }
  }

  const raw = await callModel({ system: SYSTEM_PROMPT, user: buildUserMessage(permit, sources, req) }, signal)
  const parsed = parseModelAnswer(raw)
  if (!parsed) throw new AnswerFormatError()
  return groundAnswer(parsed, sources, req)
}
