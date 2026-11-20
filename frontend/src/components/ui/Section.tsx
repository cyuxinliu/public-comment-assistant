import type { ReactNode } from 'react'

export function Section({ id, title, description, action, children }: { id?: string; title: string; description?: ReactNode; action?: ReactNode; children: ReactNode }) {
  const headingId = id ? `${id}-heading` : undefined
  return (
    <section id={id} aria-labelledby={headingId} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 id={headingId} className="text-lg font-semibold text-slate-900">{title}</h2>
          {description && <p className="mt-1 text-sm text-slate-600">{description}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  )
}
