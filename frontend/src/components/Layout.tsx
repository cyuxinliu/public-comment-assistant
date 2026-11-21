import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { USE_LOCAL_DATA, USE_MOCKS } from '../api'

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-white focus:px-3 focus:py-2 focus:shadow">
        Skip to content
      </a>
      {USE_MOCKS && (
        <div role="note" className="border-b border-amber-300 bg-amber-50 px-4 py-2 text-center text-sm text-amber-900">
          <strong className="font-semibold">Demo mode:</strong> all permits, documents, viewpoints, and AI answers shown are mock placeholders, not real records.
        </div>
      )}
      {USE_LOCAL_DATA && (
        <div role="note" className="border-b border-teal-200 bg-teal-50 px-4 py-2 text-center text-sm text-teal-950">
          Verified PAL50 records · Questions use one labeled sample answer. General document search is not connected yet.
        </div>
      )}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2.5 rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-600">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-teal-700 text-white" aria-hidden>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8l-5-5Z" /><path d="m9 14 2 2 4-4" /></svg>
            </span>
            <span>
              <span className="block text-sm font-bold leading-tight text-slate-900">Public Comment Research</span>
              <span className="block text-xs text-slate-500">Beaumont, Texas · Prototype</span>
            </span>
          </Link>
        </div>
      </header>
      <main id="main" className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">{children}</main>
      <footer className="border-t border-slate-200 bg-white">
        <p className="mx-auto max-w-6xl px-4 py-5 text-xs text-slate-500 sm:px-6">
          Research prototype. Always confirm deadlines and quotes against the official agency record before submitting a public comment.
        </p>
      </footer>
    </div>
  )
}
