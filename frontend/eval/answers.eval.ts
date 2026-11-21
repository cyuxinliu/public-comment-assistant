/**
 * Runs the test questions through the real pipeline and model.
 *
 *   ANTHROPIC_API_KEY=sk-ant-... npm run eval
 *
 * Uses the key of whoever runs it and costs a little per run (~14 short requests).
 * Results are also written to eval/results/latest.json (gitignored) for review.
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { afterAll, describe, expect, it } from 'vitest'
import { localPermits } from '../src/api/local'
import { createClaudeCaller } from '../src/answer/claude'
import { answerQuestion } from '../src/answer/pipeline'
import type { AIAnswer } from '../src/types'
import { CASES, PERMIT_ID, type EvalCase } from './questions'

const key = process.env.ANTHROPIC_API_KEY
const permit = localPermits.find((p) => p.id === PERMIT_ID)!
const results: { case: EvalCase['id']; origin: EvalCase['origin']; pass: boolean; failures: string[]; answer: AIAnswer | null; error?: string }[] = []

function check(c: EvalCase, a: AIAnswer): string[] {
  const failures: string[] = []
  if (!c.status.includes(a.status)) failures.push(`status ${a.status}, expected ${c.status.join(' | ')}`)
  const cited = new Set(a.citations.map((x) => `${x.sourceId}/${x.passageId}`))
  for (const group of c.mustCite ?? []) if (!group.some((id) => cited.has(id))) failures.push(`missing citation: one of ${group.join(', ')}`)
  const text = [a.answer, a.missingInfo, a.clarifyingQuestion].filter(Boolean).join(' ')
  for (const re of c.mustSay ?? []) if (!re.test(text)) failures.push(`should say ${re}`)
  for (const re of c.mustNotSay ?? []) if (re.test(text)) failures.push(`should not say ${re}`)
  // Every numeric citation from the record must carry its emissions label.
  for (const x of a.citations) {
    const p = permit.sources.find((s) => s.id === x.sourceId)?.passages.find((q) => q.id === x.passageId)
    if (p?.emissionsKind && x.emissionsKind !== p.emissionsKind) failures.push(`citation ${x.passageId} lost its emissions label`)
  }
  return failures
}

describe.skipIf(!key)('Component 3 answers (live model)', () => {
  const callModel = key ? createClaudeCaller(key) : null

  for (const c of CASES) {
    it(`${c.id} [${c.scope}] ${c.question}`, async () => {
      let answer: AIAnswer | null = null
      let failures: string[]
      let error: string | undefined
      try {
        answer = await answerQuestion(permit, { permitId: permit.id, question: c.question, scope: c.scope }, callModel!)
        failures = check(c, answer)
      } catch (e) {
        error = (e as Error).message
        failures = [`error: ${error}`]
      }
      results.push({ case: c.id, origin: c.origin, pass: failures.length === 0, failures, answer, error })
      expect(failures, `${c.why}\nAnswer: ${JSON.stringify(answer, null, 2)}`).toEqual([])
    })
  }

  afterAll(() => {
    mkdirSync('eval/results', { recursive: true })
    writeFileSync('eval/results/latest.json', JSON.stringify({ ranAt: new Date().toISOString(), results }, null, 2))
    const passed = results.filter((r) => r.pass).length
    console.log(`\nComponent 3 eval: ${passed}/${results.length} passed. Details: eval/results/latest.json`)
  })
})

it.skipIf(!!key)('eval skipped: set ANTHROPIC_API_KEY to your own key to run it', () => {})
