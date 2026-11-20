import { Link } from 'react-router-dom'
import { formatDate } from '../../lib/commentStatus'
import type { PermitSummary } from '../../types'
import { MockBadge } from '../ui/Badge'
import { ArrowRightIcon, CalendarIcon, MapPinIcon } from '../ui/Icons'
import { StatusBadge } from '../ui/StatusBadge'

export function PermitCard({ permit }: { permit: PermitSummary }) {
  const { publicComment: pc } = permit
  // The list has no sources, so a status without a linked notice is shown as unverified.
  const status = pc.status !== 'unverified' && !pc.noticeSourceId ? 'unverified' : pc.status
  const deadline = status === 'unverified' ? null : pc.deadline

  return (
    <article className="group relative flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-teal-300 hover:shadow-md focus-within:ring-2 focus-within:ring-teal-600">
      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge status={status} />
        {permit.dataStatus === 'mock' && <MockBadge />}
      </div>

      <h3 className="mt-3 text-base font-semibold text-slate-900">
        <Link to={`/permits/${permit.id}`} className="after:absolute after:inset-0 focus:outline-none">
          {permit.facilityName}
        </Link>
      </h3>
      <p className="mt-0.5 text-sm text-slate-500">
        {permit.permitType ? `${permit.permitType} · ` : ''}Permit {permit.permitNumber}
      </p>

      <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-slate-700">{permit.proposalSummary}</p>

      <dl className="mt-4 space-y-1.5 text-sm text-slate-600">
        <div className="flex items-center gap-2">
          <MapPinIcon className="shrink-0 text-slate-400" />
          <dt className="sr-only">Location</dt>
          <dd>{permit.location.city}, {permit.location.county} County</dd>
        </div>
        <div className="flex items-center gap-2">
          <CalendarIcon className="shrink-0 text-slate-400" />
          <dt className="sr-only">Comment deadline</dt>
          <dd>
            {deadline ? (
              <>{status === 'closed' ? 'Closed' : 'Deadline'} {formatDate(deadline)}</>
            ) : (
              <span className="font-medium text-amber-800">Deadline unverified</span>
            )}
          </dd>
        </div>
      </dl>

      <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-teal-700 group-hover:gap-2 transition-all">
        View permit details <ArrowRightIcon />
      </span>
    </article>
  )
}
