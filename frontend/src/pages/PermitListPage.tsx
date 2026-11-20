import { api } from '../api'
import { PermitCard } from '../components/permit/PermitCard'
import { ErrorState } from '../components/ui/States'
import { useAsync } from '../hooks/useAsync'

export function PermitListPage() {
  const { state, retry } = useAsync((signal) => api.listPermits(signal), 'permits')

  return (
    <>
      <div className="max-w-2xl">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Air permits near Beaumont</h1>
        <p className="mt-2 text-slate-600">
          See what facilities are asking to change, whether you can still comment, and what the official documents actually say.
        </p>
      </div>

      <div className="mt-8">
        {state.status === 'loading' && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true" aria-label="Loading permits">
            {[0, 1, 2].map((i) => <div key={i} className="h-64 animate-pulse rounded-xl border border-slate-200 bg-white" />)}
          </div>
        )}
        {state.status === 'error' && <ErrorState title="Couldn’t load permits" message={state.error.message} onRetry={retry} />}
        {state.status === 'success' && (
          state.data.length === 0 ? (
            <p className="text-slate-600">No permits are loaded yet.</p>
          ) : (
            <>
              <p className="mb-3 text-sm text-slate-500">{state.data.length} permit{state.data.length === 1 ? '' : 's'}</p>
              <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {state.data.map((p) => <li key={p.id} className="flex"><div className="flex w-full"><PermitCard permit={p} /></div></li>)}
              </ul>
            </>
          )
        )}
      </div>
    </>
  )
}
