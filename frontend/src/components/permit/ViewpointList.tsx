import { speakerRoleLabel } from '../../lib/labels'
import type { Document, Viewpoint } from '../../types'
import { Badge, type BadgeTone } from '../ui/Badge'
import { EmptyState } from '../ui/States'
import { link } from '../ui/buttonStyles'

const roleTone: Record<string, BadgeTone> = { applicant: 'blue', agency: 'slate', community: 'green', other: 'slate' }

export function ViewpointList({ viewpoints, sources }: { viewpoints: Viewpoint[]; sources: Document[] }) {
  if (viewpoints.length === 0) {
    return <EmptyState title="No attributed viewpoints loaded for this permit." />
  }
  return (
    <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {viewpoints.map((v, i) => {
        const source = sources.find((s) => s.id === v.sourceId)
        return (
          <li key={i} className="flex flex-col rounded-lg border border-slate-200 bg-slate-50/60 p-4">
            {v.speakerRole && <Badge tone={roleTone[v.speakerRole]} className="self-start">{speakerRoleLabel[v.speakerRole]}</Badge>}
            <p className="mt-2 text-sm font-semibold text-slate-900">{v.speaker}</p>
            <p className="mt-1 flex-1 text-sm leading-relaxed text-slate-700">{v.summary}</p>
            <p className="mt-3 text-xs text-slate-500">
              Source:{' '}
              {source ? (
                <a href={source.url} target="_blank" rel="noopener noreferrer" className={link}>
                  {source.title}<span className="sr-only"> (opens in a new tab)</span>
                </a>
              ) : (
                <span className="text-red-700">source missing from record</span>
              )}
            </p>
          </li>
        )
      })}
    </ul>
  )
}
