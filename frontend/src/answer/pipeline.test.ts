import { describe, expect, it, vi } from 'vitest'
import { localPermits } from '../api/local'
import { excerptIsVerbatim } from '../lib/citation'
import type { AskRequest } from '../types'
import { UNSUPPORTED_ANSWER } from './ground'
import { AnswerFormatError, answerQuestion, type CallModel, type ModelPrompt } from './pipeline'

const pal50 = localPermits[0]
const summaryCase = localPermits[1]
const req = (over: Partial<AskRequest> = {}): AskRequest => ({ permitId: pal50.id, question: 'Would this renewal let the refinery emit more nitrogen oxides?', scope: 'both', ...over })

/** Fake model: records the prompt and returns a fixed JSON answer. */
function fakeModel(output: unknown) {
  const calls: ModelPrompt[] = []
  const call: CallModel = async (prompt) => {
    calls.push(prompt)
    return output
  }
  return { call, calls }
}

const answer = (over: Record<string, unknown> = {}) => ({
  status: 'answered',
  answer: 'No. The proposed NOx limit equals the existing limit of 2,088.19 tons per year.',
  citations: [{ sourceId: 'src-technical', passageId: 't1' }, { sourceId: 'src-technical', passageId: 't2' }, { sourceId: 'src-technical', passageId: 't3' }],
  missingInfo: null,
  clarifyingQuestion: null,
  suggestedQuestions: [],
  ...over,
})

describe('answer pipeline', () => {
  it('sends only passages in the selected scope', async () => {
    const m = fakeModel(answer({ status: 'no_evidence', answer: '', citations: [] }))
    await answerQuestion(pal50, req({ scope: 'facility_history' }), m.call)
    const { user } = m.calls[0]
    expect(user).toContain('passageId="h2"')
    expect(user).toContain('sourceId="src-community"')
    expect(user).not.toContain('sourceId="src-technical"')
    expect(user).not.toContain('sourceId="src-notice"')
    expect(user).toContain('<not_searched>')

    const both = fakeModel(answer())
    await answerQuestion(pal50, req(), both.call)
    for (const s of pal50.sources) for (const p of s.passages) expect(both.calls[0].user).toContain(`passageId="${p.id}"`)
  })

  it('labels emissions passages in the prompt from the record', async () => {
    const m = fakeModel(answer())
    await answerQuestion(pal50, req(), m.call)
    expect(m.calls[0].user).toMatch(/passageId="t2"[^>]*emissionsKind="proposed_limit"/)
    expect(m.calls[0].user).toMatch(/passageId="h2"[^>]*emissionsKind="reported"/)
    expect(m.calls[0].user).not.toMatch(/passageId="t3"[^>]*emissionsKind=/)
  })

  it('fills excerpts, locators, and emissions labels from the record', async () => {
    const m = fakeModel(answer({ citations: [{ sourceId: 'src-technical', passageId: 't2' }, { sourceId: 'src-technical', passageId: 't3' }, { sourceId: 'src-history', passageId: 'h2' }] }))
    const a = await answerQuestion(pal50, req(), m.call)
    expect(a.status).toBe('answered')
    expect(a.isSample).toBe(false)
    expect(a.citations.map((c) => c.emissionsKind)).toEqual(['proposed_limit', undefined, 'reported'])
    for (const c of a.citations) {
      const source = pal50.sources.find((s) => s.id === c.sourceId)!
      expect(excerptIsVerbatim(c, source)).toBe(true)
      expect(c.locator).toBe(source.passages.find((p) => p.id === c.passageId)!.locator)
    }
  })

  it('drops made-up and out-of-scope citations and downgrades the status', async () => {
    const m = fakeModel(answer({ citations: [{ sourceId: 'src-technical', passageId: 't1' }, { sourceId: 'src-technical', passageId: 't99' }, { sourceId: 'src-made-up', passageId: 'x1' }, { sourceId: 'src-technical', passageId: 't1' }] }))
    const a = await answerQuestion(pal50, req(), m.call)
    expect(a.status).toBe('insufficient_evidence')
    expect(a.citations.map((c) => c.passageId)).toEqual(['t1'])
    expect(a.missingInfo).toMatch(/2 cited passage\(s\) could not be matched/)

    // A permit-scope passage cited while searching facility history is not allowed.
    const h = fakeModel(answer({ citations: [{ sourceId: 'src-technical', passageId: 't2' }] }))
    const ha = await answerQuestion(pal50, req({ scope: 'facility_history' }), h.call)
    expect(ha.status).toBe('no_evidence')
    expect(ha.answer).toBe('')
    expect(ha.citations).toEqual([])
    expect(ha.missingInfo).toBe(UNSUPPORTED_ANSWER)
  })

  it('never shows an answer without verified citations', async () => {
    const a = await answerQuestion(pal50, req(), fakeModel(answer({ citations: [] })).call)
    expect(a).toMatchObject({ status: 'no_evidence', answer: '', citations: [] })
  })

  it('passes clarification through without citations', async () => {
    const m = fakeModel(answer({ status: 'needs_clarification', answer: 'ignored', clarifyingQuestion: 'Do you mean emissions or the comment process?', suggestedQuestions: ['a', 'b', 'c', 'd'] }))
    const a = await answerQuestion(pal50, req({ question: 'Is it bad?' }), m.call)
    expect(a).toMatchObject({ status: 'needs_clarification', answer: '', citations: [], clarifyingQuestion: 'Do you mean emissions or the comment process?' })
    expect(a.suggestedQuestions).toEqual(['a', 'b', 'c'])
  })

  it('keeps no_evidence answers free of unsupported text', async () => {
    const a = await answerQuestion(pal50, req({ question: 'What are benzene emissions?' }), fakeModel(answer({ status: 'no_evidence', answer: 'Probably low.', citations: [{ sourceId: 'src-technical', passageId: 't1' }], missingInfo: 'No benzene data is loaded.' })).call)
    expect(a).toMatchObject({ status: 'no_evidence', answer: '', citations: [], missingInfo: 'No benzene data is loaded.' })
  })

  it('does not call the model when the scope has no documents', async () => {
    const call = vi.fn<CallModel>()
    const a = await answerQuestion(summaryCase, req({ permitId: summaryCase.id, scope: 'facility_history' }), call)
    expect(call).not.toHaveBeenCalled()
    expect(a.status).toBe('no_evidence')
    expect(a.missingInfo).toMatch(/Try “Both”/)
  })

  it('rejects malformed model output', async () => {
    await expect(answerQuestion(pal50, req(), fakeModel({ nope: true }).call)).rejects.toBeInstanceOf(AnswerFormatError)
    await expect(answerQuestion(pal50, req(), fakeModel(null).call)).rejects.toBeInstanceOf(AnswerFormatError)
  })
})
