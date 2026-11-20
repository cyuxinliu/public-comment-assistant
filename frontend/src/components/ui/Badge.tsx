import type { ReactNode } from 'react'

export type BadgeTone = 'green' | 'slate' | 'amber' | 'blue' | 'violet' | 'red'

const tones: Record<BadgeTone, string> = {
  green: 'bg-emerald-50 text-emerald-800 ring-emerald-600/20',
  slate: 'bg-slate-100 text-slate-700 ring-slate-500/20',
  amber: 'bg-amber-50 text-amber-800 ring-amber-600/25',
  blue: 'bg-sky-50 text-sky-800 ring-sky-600/20',
  violet: 'bg-violet-50 text-violet-800 ring-violet-600/20',
  red: 'bg-red-50 text-red-800 ring-red-600/20',
}

export function Badge({ tone = 'slate', children, className = '' }: { tone?: BadgeTone; children: ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset whitespace-nowrap ${tones[tone]} ${className}`}>
      {children}
    </span>
  )
}

/** Marks placeholder content. Used anywhere mock or sample data is shown. */
export function MockBadge({ label = 'Mock data' }: { label?: string }) {
  return (
    <span className="inline-flex items-center rounded border border-dashed border-amber-500 bg-amber-50 px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-amber-800 whitespace-nowrap">
      {label}
    </span>
  )
}
