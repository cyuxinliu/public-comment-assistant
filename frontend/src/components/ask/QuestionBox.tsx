import { useEffect, useId, useRef, useState, type FormEvent } from 'react'
import { api, getMockScenario, setMockScenario, USE_LOCAL_DATA, USE_MOCKS } from '../../api'
import { DEMO_QUESTION } from '../../api/local'
import { MOCK_SCENARIOS, type MockScenario } from '../../mocks/answers'
import type { AIAnswer, Permit, SearchScope } from '../../types'
import { AnswerCard, AnswerLoading } from '../evidence/AnswerCard'
import { ErrorState } from '../ui/States'
import { useApiKey } from '../../answer/apiKey'
import { ApiKeyPanel } from './ApiKeyPanel'
import { btnPrimary } from '../ui/buttonStyles'

const SCOPES: { value: SearchScope; label: string; hint: string }[] = [
  { value: 'permit', label: 'This permit', hint: 'Notice, application, technical review, comments' },
  { value: 'facility_history', label: 'Facility history', hint: 'Past emissions and compliance records' },
  { value: 'both', label: 'Both', hint: 'Search everything loaded' },
]

const EXAMPLE = DEMO_QUESTION

type AskState = { status: 'idle' } | { status: 'loading' } | { status: 'error'; message: string } | { status: 'done'; answer: AIAnswer }

export function QuestionBox({ permit }: { permit: Permit }) {
  const [question, setQuestion] = useState('')
  const [scope, setScope] = useState<SearchScope>('both')
  const [state, setState] = useState<AskState>({ status: 'idle' })
  const ctrl = useRef<AbortController | null>(null)
  const ids = useId()
  const apiKey = useApiKey()
  /** Local data without the user's own key: only the labeled sample answer is available. */
  const sampleOnly = USE_LOCAL_DATA && !apiKey

  const resultRef = useRef<HTMLDivElement>(null)

  useEffect(() => () => ctrl.current?.abort(), [])

  // Bring the loading state / answer into view; on short screens it renders below the fold.
  useEffect(() => {
    if (state.status === 'idle') return
    const el = resultRef.current
    if (!el) return
    const { top } = el.getBoundingClientRect()
    if (top < 0 || top > window.innerHeight * 0.3) {
      const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
      el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
    }
  }, [state.status])

  const ask = (q: string, s: SearchScope = scope) => {
    const text = q.trim()
    if (!text) return
    ctrl.current?.abort()
    const c = (ctrl.current = new AbortController())
    setState({ status: 'loading' })
    api.ask({ permitId: permit.id, question: text, scope: s }, c.signal).then(
      (answer) => setState({ status: 'done', answer }),
      (err: Error) => {
        if (err.name !== 'AbortError') setState({ status: 'error', message: err.message })
      },
    )
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    ask(question)
  }

  const askSuggested = (q: string) => {
    setQuestion(q)
    ask(q)
  }

  const historyCount = permit.sources.filter((s) => s.scope === 'facility_history').length

  return (
    <div>
      {USE_LOCAL_DATA && <div className="mb-4"><ApiKeyPanel /></div>}
      <form onSubmit={onSubmit} className="space-y-4">
        <fieldset>
          <legend className="text-sm font-medium text-slate-800">{sampleOnly ? 'Include documents from' : 'Search in'}</legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-3">
            {SCOPES.map((o) => (
              <label key={o.value} className="relative flex cursor-pointer flex-col rounded-lg border border-slate-300 bg-white p-3 text-sm has-checked:border-teal-600 has-checked:bg-teal-50 has-checked:ring-1 has-checked:ring-teal-600 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-teal-600">
                <input type="radio" name={`${ids}-scope`} value={o.value} checked={scope === o.value} onChange={() => setScope(o.value)} className="sr-only" />
                <span className="font-semibold text-slate-900">{o.label}</span>
                <span className="mt-0.5 text-xs text-slate-500">
                  {o.value === 'facility_history' && historyCount === 0 ? 'No records loaded' : o.hint}
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <div>
          <label htmlFor={`${ids}-q`} className="text-sm font-medium text-slate-800">Your question</label>
          <textarea
            id={`${ids}-q`}
            rows={3}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) ask(question)
            }}
            placeholder="Ask in plain language, e.g. “What is the facility asking to change?”"
            className="mt-2 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-[15px] text-slate-900 shadow-xs placeholder:text-slate-400 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/30"
          />
          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
            <span className="text-slate-500">Try:</span>
            <button type="button" onClick={() => setQuestion(EXAMPLE)} className="rounded-full bg-slate-100 px-3 py-1 text-left text-slate-700 hover:bg-slate-200 focus-visible:outline-2 focus-visible:outline-teal-600">
              {EXAMPLE}
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-slate-500">{sampleOnly ? 'Sample answer only. Try the example question, or add your API key above for live answers.' : 'Answers come only from the documents loaded for this permit. Check each excerpt against the original.'}</p>
          <button type="submit" className={btnPrimary} disabled={!question.trim() || state.status === 'loading'}>
            {state.status === 'loading' ? 'Loading…' : sampleOnly ? 'View sample answer' : 'Ask'}
          </button>
        </div>

        {USE_MOCKS && <MockControls />}
      </form>

      <div ref={resultRef} className="mt-6 scroll-mt-4" aria-live="polite">
        {state.status === 'loading' && <AnswerLoading />}
        {state.status === 'error' && <ErrorState title="We couldn’t get an answer" message={state.message} onRetry={() => ask(question)} />}
        {state.status === 'done' && <AnswerCard answer={state.answer} sources={permit.sources} permit={permit} onAskSuggested={askSuggested} />}
      </div>
    </div>
  )
}

/** Dev-only: force each answer state while the real AI service is being built. */
function MockControls() {
  const [scenario, setScenario] = useState<MockScenario>(getMockScenario())
  const id = useId()
  return (
    <details className="rounded-lg border border-dashed border-amber-400 bg-amber-50/60 px-3 py-2 text-sm text-amber-950">
      <summary className="cursor-pointer font-medium">Demo controls (mock mode only)</summary>
      <label htmlFor={id} className="mt-2 block text-xs">Mock response</label>
      <select
        id={id}
        value={scenario}
        onChange={(e) => {
          const s = e.target.value as MockScenario
          setScenario(s)
          setMockScenario(s)
        }}
        className="mt-1 rounded-md border border-amber-300 bg-white px-2 py-1 text-sm"
      >
        {MOCK_SCENARIOS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
      </select>
    </details>
  )
}
