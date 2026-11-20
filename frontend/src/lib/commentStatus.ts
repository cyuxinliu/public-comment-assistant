import type { CommentStatus, Document, PublicComment } from '../types'

export interface ResolvedCommentStatus {
  status: CommentStatus
  deadline: string | null
  notice: Document | null
  /** explanation shown when the displayed status differs from the record */
  note?: string
  deadlinePassed: boolean
}

/**
 * Status is only "open" or "closed" if an official notice backs it up (AGENTS.md shared rule).
 * Otherwise it is shown as unverified, which is different from a confirmed closed period.
 */
export function resolveCommentStatus(pc: PublicComment, sources: Document[] = [], today = new Date()): ResolvedCommentStatus {
  const notice = pc.noticeSourceId ? sources.find((s) => s.id === pc.noticeSourceId) ?? null : null
  const deadlinePassed = !!pc.deadline && parseDate(pc.deadline) < startOfDay(today)

  if (pc.status !== 'unverified' && !pc.noticeSourceId) {
    return { status: 'unverified', deadline: null, notice: null, deadlinePassed: false, note: 'No official notice is linked to this record.' }
  }
  if (pc.status === 'open' && deadlinePassed) {
    return { status: 'open', deadline: pc.deadline, notice, deadlinePassed, note: 'The deadline in the notice has passed. Check with the agency before commenting.' }
  }
  return { status: pc.status, deadline: pc.status === 'unverified' ? null : pc.deadline, notice, deadlinePassed }
}

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate())

/** Parse YYYY-MM-DD as a local date (avoids the UTC off-by-one). */
export function parseDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, (m ?? 1) - 1, d ?? 1)
}

export function formatDate(iso: string): string {
  return parseDate(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

export function daysUntil(iso: string, today = new Date()): number {
  return Math.round((parseDate(iso).getTime() - startOfDay(today).getTime()) / 86_400_000)
}
