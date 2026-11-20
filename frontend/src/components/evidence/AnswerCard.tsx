import { scopeLabel } from '../../lib/labels'
import type { AIAnswer, AnswerStatus, Document, Permit } from '../../types'
import { Badge, MockBadge, type BadgeTone } from '../ui/Badge'
import { AlertIcon, InfoIcon, SearchIcon } from '../ui/Icons'
import { CitationCard } from './CitationCard'

const statusInfo: Record<AnswerStatus, { label: string; tone: BadgeTone }> = {
  answered: { label: 'Supported by sources', tone: 'green' },
  insufficient_evidence: { label: 'Limited evidence', tone: 'amber' },
  no_evidence: { label: 'No evidence found', tone: 'slate' },
  needs_clarification: { label: 'Needs clarification', tone: 'blue' },
}

const scopeText = (s: AIAnswer['scope']) => (s === 'both' ? 'this permit and facility history' : scopeLabel[s].toLowerCase())

interface Props {
  answer: AIAnswer
  sources: Document[]
  permit: Pick<Permit, 'permitNumber' | 'facilityName' | 'dataStatus'>
  onAskSuggested?: (q: string) => void
}

/** Renders a structured AIAnswer from the retrieval backend. Purely presentational. */
export function AnswerCard({ answer, sources, permit, onAskSuggested }: Props) {
  const info = statusInfo[answer.status]

  return (
    <article aria-label="Answer" className="rounded-xl border border-slate-200 bg-slate-50/50 p-5">
      <header className="flex flex-wrap items-center gap-2">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Answer</h3>
        <Badge tone={info.tone}>{info.label}</Badge>
        {answer.isSample && <MockBadge label="Sample answer" />}
      </header>
      <p className="mt-1 text-xs text-slate-500">
        “{answer.question}” · searched {scopeText(answer.scope)}
      </p>

      {answer.status === 'needs_clarification' && (
        <div className="mt-4 rounded-lg border border-sky-200 bg-sky-50 p-4 text-sm text-sky-950">
          <p className="flex gap-2 font-medium"><InfoIcon className="mt-0.5 shrink-0" /> {answer.clarifyingQuestion ?? 'Could you rephrase or add detail to your question?'}</p>
          {!!answer.suggestedQuestions?.length && (
            <div className="mt-3 flex flex-wrap gap-2">
              {answer.suggestedQuestions.map((q) => (
                <button key={q} type="button" onClick={() => onAskSuggested?.(q)} className="rounded-full bg-white px-3 py-1 text-left text-sm text-sky-900 ring-1 ring-sky-300 hover:bg-sky-100 focus-visible:outline-2 focus-visible:outline-sky-600">
                  {q}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {answer.status === 'no_evidence' && (
        <div className="mt-4 flex gap-3 rounded-lg border border-dashed border-slate-300 bg-white p-4 text-sm text-slate-700">
          <SearchIcon className="mt-0.5 shrink-0 text-slate-400" />
          <div>
            <p className="font-medium text-slate-900">No relevant evidence found in {scopeText(answer.scope)}.</p>
            <p className="mt-1">{answer.missingInfo ?? 'The loaded documents don’t address this question.'}</p>
            {answer.answer && <p className="mt-2">{answer.answer}</p>}
          </div>
        </div>
      )}

      {(answer.status === 'answered' || answer.status === 'insufficient_evidence') && (
        <>
          {answer.status === 'insufficient_evidence' && (
            <p className="mt-4 flex gap-2 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-950">
              <AlertIcon className="mt-0.5 shrink-0" />
              <span><strong className="font-semibold">Based on insufficient evidence.</strong> The sources below only partly answer this question. Don’t rely on it without reading the originals.</span>
            </p>
          )}
          <p className="mt-4 text-[15px] leading-relaxed text-slate-900">{answer.answer}</p>
          {answer.missingInfo && answer.status === 'answered' && (
            <p className="mt-3 flex gap-2 text-sm text-slate-600"><InfoIcon className="mt-0.5 shrink-0" /> <span><span className="font-medium">Not covered:</span> {answer.missingInfo}</span></p>
          )}
          {answer.missingInfo && answer.status === 'insufficient_evidence' && (
            <p className="mt-3 text-sm text-slate-700"><span className="font-medium">What’s missing:</span> {answer.missingInfo}</p>
          )}

          <h4 className="mt-6 text-sm font-semibold text-slate-900">Supporting evidence ({answer.citations.length})</h4>
          {answer.citations.length === 0 ? (
            <p className="mt-2 text-sm text-amber-800">This answer has no citations. Treat it as unverified.</p>
          ) : (
            <ol className="mt-3 space-y-3">
              {answer.citations.map((c, i) => (
                <CitationCard key={`${c.sourceId}-${c.passageId ?? i}`} index={i + 1} citation={c} source={sources.find((s) => s.id === c.sourceId)} permit={permit} />
              ))}
            </ol>
          )}
        </>
      )}
    </article>
  )
}

export function AnswerLoading() {
  return (
    <div role="status" aria-live="polite" className="rounded-xl border border-slate-200 bg-slate-50/50 p-5">
      <p className="flex items-center gap-2 text-sm font-medium text-slate-700">
        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-teal-700 border-r-transparent" aria-hidden />
        Searching the selected documents…
      </p>
      <div className="mt-4 animate-pulse space-y-2" aria-hidden>
        <div className="h-3 w-11/12 rounded bg-slate-200" />
        <div className="h-3 w-4/5 rounded bg-slate-200" />
        <div className="h-3 w-2/3 rounded bg-slate-200" />
        <div className="mt-5 h-20 rounded-lg bg-slate-200/70" />
      </div>
    </div>
  )
}

