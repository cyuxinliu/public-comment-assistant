import { daysUntil, formatDate, resolveCommentStatus } from '../../lib/commentStatus'
import type { Permit } from '../../types'
import { AlertIcon, ExternalLinkIcon } from '../ui/Icons'
import { StatusBadge } from '../ui/StatusBadge'
import { link } from '../ui/buttonStyles'

const copy = {
  open: 'The official notice says public comments are being accepted.',
  closed: 'Public comment on this permit action is closed.',
  unverified: 'We could not confirm the comment period from an official agency record. This does not mean comments are closed — check with the agency.',
}

export function CommentStatusPanel({ permit }: { permit: Permit }) {
  const r = resolveCommentStatus(permit.publicComment, permit.sources)
  const statusSource = permit.sources.find(s => s.id === permit.publicComment.statusSourceId)
  const days = r.deadline && r.status === 'open' && !r.deadlinePassed ? daysUntil(r.deadline) : null

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Public comment</h2>
      <div className="mt-3"><StatusBadge status={r.status} /></div>

      <div className="mt-3">
        {r.deadline ? (
          <>
            <p className="text-xs font-medium text-slate-500">{r.status === 'closed' ? 'Comment period ended' : 'Comment deadline'}</p>
            <p className="text-2xl font-semibold tracking-tight text-slate-900">{formatDate(r.deadline)}</p>
            {days !== null && <p className="text-sm text-emerald-800">{days === 0 ? 'Due today' : `${days} day${days === 1 ? '' : 's'} left`}</p>}
          </>
        ) : (
          <p className="text-lg font-semibold text-amber-800">Deadline unverified</p>
        )}
      </div>

      <p className="mt-3 text-sm text-slate-600">{copy[r.status]}</p>

      {statusSource && (
        <p className="mt-3 text-sm text-slate-600">
          Status based on: <a href={statusSource.url} target="_blank" rel="noopener noreferrer" className={link}>{statusSource.title}</a>
          {statusSource.date && <> · {formatDate(statusSource.date)}</>}
        </p>
      )}

      {r.note && (
        <p className="mt-3 flex gap-2 rounded-md bg-amber-50 p-2.5 text-sm text-amber-900">
          <AlertIcon className="mt-0.5 shrink-0" /> {r.note}
        </p>
      )}

      <div className="mt-4 border-t border-slate-100 pt-3 text-sm">
        {r.notice ? (
          <a href={r.notice.url} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center gap-1 ${link}`}>
            Official notice: {r.notice.title} <ExternalLinkIcon className="shrink-0" />
            <span className="sr-only">(opens in a new tab)</span>
          </a>
        ) : (
          <span className="text-slate-500">No official notice loaded.</span>
        )}
      </div>
    </div>
  )
}
