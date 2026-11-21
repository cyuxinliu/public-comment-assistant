import type { AnswerStatus } from '../types'

/**
 * What the model must return (enforced with structured outputs).
 *
 * Citations are passage IDs only. The excerpt, locator, and emissions label are filled
 * in from the verified record afterward (see ground.ts), never copied from model text.
 */
export interface ModelAnswer {
  status: AnswerStatus
  answer: string
  citations: { sourceId: string; passageId: string }[]
  missingInfo: string | null
  clarifyingQuestion: string | null
  suggestedQuestions: string[]
}

const nullableString = { anyOf: [{ type: 'string' }, { type: 'null' }] }

export const MODEL_ANSWER_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['status', 'answer', 'citations', 'missingInfo', 'clarifyingQuestion', 'suggestedQuestions'],
  properties: {
    status: { type: 'string', enum: ['answered', 'insufficient_evidence', 'no_evidence', 'needs_clarification'] },
    answer: { type: 'string' },
    citations: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['sourceId', 'passageId'],
        properties: { sourceId: { type: 'string' }, passageId: { type: 'string' } },
      },
    },
    missingInfo: nullableString,
    clarifyingQuestion: nullableString,
    suggestedQuestions: { type: 'array', items: { type: 'string' } },
  },
} as const
