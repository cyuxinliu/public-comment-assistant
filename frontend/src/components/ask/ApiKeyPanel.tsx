import { useId, useState, type FormEvent } from 'react'
import { clearApiKey, looksLikeApiKey, maskKey, setApiKey, useApiKey } from '../../answer/apiKey'
import { btnSecondary, link } from '../ui/buttonStyles'
import { InfoIcon } from '../ui/Icons'

/**
 * Bring-your-own-key entry. Live answers run on the viewer's own Anthropic account;
 * without a key the question box shows the labeled sample answer.
 */
export function ApiKeyPanel() {
  const key = useApiKey()
  const [draft, setDraft] = useState('')
  const [remember, setRemember] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const ids = useId()

  if (key) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-teal-200 bg-teal-50/60 px-3 py-2 text-sm text-teal-950">
        <p>
          <span className="font-semibold">Live answers on.</span> Using your API key <span className="font-mono">{maskKey(key)}</span>. Questions are billed to your Anthropic account.
        </p>
        <button type="button" className={btnSecondary} onClick={clearApiKey}>Remove key</button>
      </div>
    )
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!looksLikeApiKey(draft)) {
      setError('That doesn’t look like an Anthropic API key. Keys start with “sk-ant-”.')
      return
    }
    setApiKey(draft, remember)
    setDraft('')
    setError(null)
  }

  return (
    <form onSubmit={onSubmit} aria-label="Use your own API key" className="rounded-lg border border-slate-200 bg-white p-3 text-sm">
      <p className="flex gap-2 text-slate-700">
        <InfoIcon className="mt-0.5 shrink-0 text-slate-400" />
        <span>
          <span className="font-semibold text-slate-900">Want live answers?</span> Enter your own Anthropic API key. It stays in this browser tab and is sent only to Anthropic, which bills your account. Without a key, you can view the sample answer. Get a key in the{' '}
          <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noreferrer" className={link}>Anthropic Console</a> (console.anthropic.com).
        </span>
      </p>
      <div className="mt-3 flex flex-wrap items-end gap-2">
        <div className="min-w-0 flex-1">
          <label htmlFor={`${ids}-key`} className="sr-only">Anthropic API key</label>
          <input
            id={`${ids}-key`}
            type="password"
            autoComplete="off"
            spellCheck={false}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="sk-ant-…"
            aria-invalid={!!error}
            aria-describedby={error ? `${ids}-err` : undefined}
            className="block w-full rounded-lg border border-slate-300 px-3 py-1.5 font-mono text-sm focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/30"
          />
        </div>
        <button type="submit" className={btnSecondary} disabled={!draft.trim()}>Use key</button>
      </div>
      <label className="mt-2 flex items-center gap-2 text-xs text-slate-600">
        <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
        Remember until I close this tab (otherwise it’s forgotten when the page reloads)
      </label>
      {error && <p id={`${ids}-err`} className="mt-2 text-xs text-red-700">{error}</p>}
    </form>
  )
}
