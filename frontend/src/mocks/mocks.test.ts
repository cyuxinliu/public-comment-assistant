import { describe, expect, it } from 'vitest'
import { excerptIsVerbatim } from '../lib/citation'
import type { SearchScope } from '../types'
import { mockAnswer } from './answers'
import { mockPermits } from './permits'

const NOX = 'Would this renewal let the refinery emit more nitrogen oxides?'
const caseFile = mockPermits.find((p) => p.id === 'mock-refinery-renewal')!

describe('mock permit records', () => {
  it('are all labeled as mock', () => {
    for (const p of mockPermits) expect(p.dataStatus).toBe('mock')
  })

  it('reference only sources that exist', () => {
    for (const p of mockPermits) {
      const ids = new Set(p.sources.map((s) => s.id))
      for (const v of p.viewpoints) expect(ids, `${p.id} viewpoint`).toContain(v.sourceId)
      if (p.publicComment.noticeSourceId) expect(ids, `${p.id} notice`).toContain(p.publicComment.noticeSourceId)
      if (p.publicComment.status === 'unverified') expect(p.publicComment.deadline).toBeNull()
    }
  })
})

describe('mock answers', () => {
  const ask = (scope: SearchScope, question = NOX) => mockAnswer(caseFile, { permitId: caseFile.id, question, scope }, 'auto')

  it.each(['permit', 'facility_history', 'both'] as const)('cite only in-scope sources, verbatim (%s)', (scope) => {
    const a = ask(scope)
    expect(a.isSample).toBe(true)
    expect(a.citations.length).toBeGreaterThan(0)
    for (const c of a.citations) {
      const src = caseFile.sources.find((s) => s.id === c.sourceId)!
      if (scope !== 'both') expect(src.scope).toBe(scope)
      expect(excerptIsVerbatim(c, src)).toBe(true)
    }
  })

  it('labels proposed limits and reported emissions separately', () => {
    const kinds = ask('both').citations.map((c) => c.emissionsKind).filter(Boolean)
    expect(kinds).toEqual(expect.arrayContaining(['proposed_limit', 'reported']))
  })

  it('reports insufficient evidence when facility history alone cannot answer', () => {
    expect(ask('facility_history').status).toBe('insufficient_evidence')
  })

  it('asks for clarification on ambiguous questions', () => {
    expect(ask('both', 'is it bad?').status).toBe('needs_clarification')
  })

  it('matches word prefixes, not fragments inside words', () => {
    const a = ask('both', 'What heater emissions events?')
    expect(a.citations.length).toBeGreaterThan(0)
    expect(ask('both', 'Tell me about art').status).toBe('no_evidence')
  })

  it('returns no evidence when nothing matches', () => {
    expect(ask('both', 'Where do zebras migrate?').status).toBe('no_evidence')
  })
})
