import { formatDate } from '../../lib/commentStatus'
import { documentTypeLabel } from '../../lib/labels'
import type { Document } from '../../types'
import { Badge } from '../ui/Badge'
import { DocumentIcon, ExternalLinkIcon } from '../ui/Icons'
import { EmptyState } from '../ui/States'

export function SourceList({ sources, noticeId, emptyText = 'No documents loaded.' }: { sources: Document[]; noticeId?: string | null; emptyText?: string }) {
  if (sources.length === 0) return <EmptyState title={emptyText} />
  return (
    <ul className="divide-y divide-slate-100">
      {sources.map((s) => (
        <li key={s.id} className="py-3 first:pt-0 last:pb-0">
          <a href={s.url} target="_blank" rel="noopener noreferrer" className="group flex gap-3 rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600">
            <DocumentIcon className="mt-0.5 shrink-0 text-slate-400 group-hover:text-teal-700" width={18} height={18} />
            <span className="min-w-0 flex-1">
              <span className="flex items-start gap-1 text-sm font-medium text-slate-900 group-hover:text-teal-800 group-hover:underline">
                {s.title}
                <ExternalLinkIcon className="mt-0.5 shrink-0 opacity-60" width={14} height={14} />
                <span className="sr-only">(opens in a new tab)</span>
              </span>
              <span className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
                {s.id === noticeId ? <Badge tone="green">Official notice</Badge> : s.documentType && <Badge>{documentTypeLabel[s.documentType]}</Badge>}
                {(s.publisher || s.date) && <span>{[s.publisher, s.date && formatDate(s.date)].filter(Boolean).join(' · ')}</span>}
              </span>
            </span>
          </a>
        </li>
      ))}
    </ul>
  )
}
