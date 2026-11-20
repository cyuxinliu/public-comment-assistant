import { describe, expect, it } from 'vitest'
import type { Document } from '../types'
import { daysUntil, formatDate, resolveCommentStatus } from './commentStatus'

const notice: Document = { id: 'n', title: 'Notice', url: '/n', scope: 'permit', passages: [] }
const today = new Date(2026, 10, 19) // Nov 19, 2026

describe('resolveCommentStatus', () => {
  it('keeps an open status that is backed by an official notice', () => {
    const r = resolveCommentStatus({ status: 'open', deadline: '2026-12-18', noticeSourceId: 'n' }, [notice], today)
    expect(r).toMatchObject({ status: 'open', deadline: '2026-12-18', deadlinePassed: false })
    expect(r.notice?.id).toBe('n')
    expect(r.note).toBeUndefined()
  })

  it('downgrades open/closed to unverified when no notice is linked', () => {
    for (const status of ['open', 'closed'] as const) {
      const r = resolveCommentStatus({ status, deadline: '2026-12-18', noticeSourceId: null }, [], today)
      expect(r.status).toBe('unverified')
      expect(r.deadline).toBeNull()
      expect(r.note).toMatch(/no official notice/i)
    }
  })

  it('never shows a deadline for an unverified status', () => {
    const r = resolveCommentStatus({ status: 'unverified', deadline: '2026-12-18', noticeSourceId: 'n' }, [notice], today)
    expect(r.status).toBe('unverified')
    expect(r.deadline).toBeNull()
  })

  it('keeps a confirmed closed period distinct from unverified', () => {
    const r = resolveCommentStatus({ status: 'closed', deadline: '2026-09-30', noticeSourceId: 'n' }, [notice], today)
    expect(r.status).toBe('closed')
    expect(r.deadline).toBe('2026-09-30')
  })

  it('warns when an "open" period is past its deadline', () => {
    const r = resolveCommentStatus({ status: 'open', deadline: '2026-11-01', noticeSourceId: 'n' }, [notice], today)
    expect(r.deadlinePassed).toBe(true)
    expect(r.note).toMatch(/deadline .* has passed/i)
  })

  it('treats the deadline day itself as not passed', () => {
    const r = resolveCommentStatus({ status: 'open', deadline: '2026-11-19', noticeSourceId: 'n' }, [notice], today)
    expect(r.deadlinePassed).toBe(false)
  })
})

describe('date helpers', () => {
  it('formats ISO dates without a timezone off-by-one', () => {
    expect(formatDate('2026-12-01')).toBe('December 1, 2026')
  })
  it('counts days until a deadline', () => {
    expect(daysUntil('2026-12-18', today)).toBe(29)
    expect(daysUntil('2026-11-19', today)).toBe(0)
  })
})
