import type { Document } from '../../types'
import { EmptyState } from '../ui/States'
import { link } from '../ui/buttonStyles'

export function FacilityHistory({ sources }: { sources: Document[] }) {
  if (sources.length === 0) {
    return <EmptyState title="No facility history records are loaded for this permit.">Past emissions reports and compliance records will appear here when available.</EmptyState>
  }
  return (
    <div className="space-y-4">
      {sources.map((s) => (
        <div key={s.id}>
          <a href={s.url} target="_blank" rel="noopener noreferrer" className={`text-sm ${link}`}>
            {s.title}<span className="sr-only"> (opens in a new tab)</span>
          </a>
          <ul className="mt-2 space-y-2">
            {s.passages.map((p, i) => (
              <li key={p.id ?? i} className="rounded-md border-l-2 border-slate-300 bg-slate-50 px-3 py-2 text-sm">
                <span className="block text-xs font-medium text-slate-500">{p.locator}</span>
                <span className="text-slate-700">{p.text}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}
