import { excerptIsVerbatim, formatCitation, sourceHref } from '../../lib/citation'
import { scopeLabel } from '../../lib/labels'
import type { Citation, Document, EmissionsKind, Permit } from '../../types'
import { Badge, MockBadge } from '../ui/Badge'
import { AlertIcon, CheckIcon, ExternalLinkIcon } from '../ui/Icons'
import { btnSecondary } from '../ui/buttonStyles'
import { CopyCitationButton } from './CopyCitationButton'

const emissionsLabel: Record<EmissionsKind, { label: string; tone: 'blue' | 'violet' }> = {
  proposed_limit: { label: 'Proposed limit', tone: 'blue' },
  reported: { label: 'Reported emissions', tone: 'violet' },
}

type PermitInfo = Pick<Permit, 'permitNumber' | 'facilityName' | 'dataStatus'>

export function CitationCard({ index, citation, source, permit }: { index: number; citation: Citation; source: Document | undefined; permit: PermitInfo }) {
  if (!source) {
    return (
      <li className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-900">
        <p className="flex gap-2 font-medium"><AlertIcon className="mt-0.5 shrink-0" /> Citation {index} points to a source that isn’t in this permit record (“{citation.sourceId}”).</p>
        <blockquote className="mt-2 border-l-2 border-red-300 pl-3 italic">{citation.excerpt}</blockquote>
        <p className="mt-2">Don’t reuse this excerpt until the source is confirmed.</p>
      </li>
    )
  }

  const verbatim = excerptIsVerbatim(citation, source)
  const emissions = citation.emissionsKind && emissionsLabel[citation.emissionsKind]

  return (
    <li className="rounded-lg border border-slate-200 bg-white p-4 shadow-xs">
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="grid h-5 w-5 place-items-center rounded-full bg-slate-800 font-semibold text-white" aria-label={`Citation ${index}`}>{index}</span>
        <Badge>{scopeLabel[source.scope]}</Badge>
        {emissions && <Badge tone={emissions.tone}>{emissions.label}</Badge>}
        {permit.dataStatus === 'mock' && <MockBadge />}
      </div>

      <blockquote className="mt-3 border-l-4 border-teal-600 bg-teal-50/50 py-2 pl-4 pr-3 font-serif text-[15px] leading-relaxed text-slate-800">
        “{citation.excerpt}”
      </blockquote>

      <dl className="mt-3 grid gap-x-4 gap-y-1 text-sm sm:grid-cols-[auto_1fr]">
        <dt className="text-slate-500">Document</dt>
        <dd className="font-medium text-slate-900">{source.title}</dd>
        <dt className="text-slate-500">Page / section</dt>
        <dd className="text-slate-800">{citation.locator}</dd>
        {source.publisher && (<><dt className="text-slate-500">Publisher</dt><dd className="text-slate-800">{source.publisher}</dd></>)}
        <dt className="text-slate-500">Original</dt>
        <dd className="truncate text-slate-600" title={source.url}>{source.url}</dd>
      </dl>

      <p className={`mt-3 flex items-center gap-1.5 text-xs ${verbatim ? 'text-emerald-800' : 'text-amber-800'}`}>
        {verbatim ? <CheckIcon width={14} height={14} /> : <AlertIcon width={14} height={14} />}
        {verbatim ? 'Excerpt matches the loaded document text.' : 'Excerpt was not found word-for-word in the loaded document. Check the original before reusing it.'}
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <a href={sourceHref(source, citation)} target="_blank" rel="noopener noreferrer" className={btnSecondary}>
          <ExternalLinkIcon /> Open original source<span className="sr-only"> (opens in a new tab)</span>
        </a>
        <CopyCitationButton text={formatCitation(citation, source, permit)} />
      </div>
    </li>
  )
}
