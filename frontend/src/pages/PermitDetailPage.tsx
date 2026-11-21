import { Link, useParams } from 'react-router-dom'
import { api, ApiError } from '../api'
import { QuestionBox } from '../components/ask/QuestionBox'
import { CommentStatusPanel } from '../components/permit/CommentStatusPanel'
import { FacilityHistory } from '../components/permit/FacilityHistory'
import { SourceList } from '../components/permit/SourceList'
import { ViewpointList } from '../components/permit/ViewpointList'
import { MockBadge } from '../components/ui/Badge'
import { ArrowLeftIcon, MapPinIcon } from '../components/ui/Icons'
import { Section } from '../components/ui/Section'
import { ErrorState } from '../components/ui/States'
import { link } from '../components/ui/buttonStyles'
import { useAsync } from '../hooks/useAsync'

export function PermitDetailPage() {
  const { permitId = '' } = useParams()
  const { state, retry } = useAsync((signal) => api.getPermit(permitId, signal), permitId)

  return (
    <>
      <Link to="/" className={`inline-flex items-center gap-1 text-sm ${link}`}>
        <ArrowLeftIcon /> All permits
      </Link>

      {state.status === 'loading' && (
        <div className="mt-6 animate-pulse space-y-4" aria-busy="true" aria-label="Loading permit">
          <div className="h-8 w-2/3 rounded bg-slate-200" />
          <div className="h-40 rounded-xl bg-slate-200/70" />
        </div>
      )}

      {state.status === 'error' && (
        <div className="mt-6">
          {state.error instanceof ApiError && state.error.status === 404 ? (
            <ErrorState title="Permit not found" message="This permit isn’t in our list. It may have been removed or the link is wrong." />
          ) : (
            <ErrorState title="Couldn’t load this permit" message={state.error.message} onRetry={retry} />
          )}
        </div>
      )}

      {state.status === 'success' && <PermitDetail permit={state.data} />}
    </>
  )
}

function PermitDetail({ permit }: { permit: import('../types').Permit }) {
  const permitSources = permit.sources.filter((s) => s.scope === 'permit')
  const historySources = permit.sources.filter((s) => s.scope === 'facility_history')

  return (
    <div className="mt-4 space-y-6">
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <header>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-slate-500">Permit {permit.permitNumber}</span>
            {permit.dataStatus === 'mock' && <MockBadge />}
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{permit.facilityName}</h1>
          <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-600">
            {permit.permitType && <span>{permit.permitType}</span>}
            <span className="inline-flex items-center gap-1"><MapPinIcon className="text-slate-400" /> {permit.location.city}, {permit.location.county} County, Texas</span>
          </p>

          <div className="mt-5 rounded-xl border border-teal-200 bg-teal-50/60 p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-teal-900">What’s being proposed</h2>
            <p className="mt-2 text-[15px] leading-relaxed text-slate-800">{permit.proposalSummary}</p>
          </div>
        </header>
        <aside aria-label="Comment status"><CommentStatusPanel permit={permit} /></aside>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="min-w-0 space-y-6">
          <Section id="ask" title="Ask about this permit" description="Get a short answer with the exact passages it comes from, so you can check them yourself.">
            <QuestionBox permit={permit} />
          </Section>

          <Section id="viewpoints" title="What people are saying" description="Positions taken by the applicant, the agency, and community groups, each linked to its source.">
            <ViewpointList viewpoints={permit.viewpoints} sources={permit.sources} />
          </Section>

          <Section id="history" title="Facility history" description="Past records for this facility. Reported emissions are historical reported figures, not permit limits.">
            <FacilityHistory sources={historySources} />
          </Section>
        </div>

        <aside className="space-y-6" aria-label="Documents">
          <Section id="documents" title="Permit documents">
            <SourceList sources={permitSources} noticeId={permit.publicComment.noticeSourceId} emptyText="No permit documents loaded yet." />
          </Section>
        </aside>
      </div>
    </div>
  )
}
