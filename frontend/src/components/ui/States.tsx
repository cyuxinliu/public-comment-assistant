import type { ReactNode } from 'react'
import { AlertIcon } from './Icons'

export function Spinner({ className = '' }: { className?: string }) {
  return <span className={`inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent ${className}`} aria-hidden />
}

export function ErrorState({ title = 'Something went wrong', message, onRetry }: { title?: string; message?: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-900">
      <div className="flex gap-3">
        <AlertIcon className="mt-0.5 shrink-0 text-red-600" />
        <div className="flex-1">
          <p className="font-semibold">{title}</p>
          {message && <p className="mt-1 text-red-800">{message}</p>}
          {onRetry && (
            <button type="button" onClick={onRetry} className="mt-3 rounded-md bg-white px-3 py-1.5 font-medium text-red-800 ring-1 ring-red-300 hover:bg-red-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600">
              Try again
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-600">
      <p className="font-medium text-slate-800">{title}</p>
      {children && <div className="mt-1">{children}</div>}
    </div>
  )
}
