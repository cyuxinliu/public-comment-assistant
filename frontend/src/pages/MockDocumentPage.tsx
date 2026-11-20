import { useEffect } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { getMockPermit } from '../api'
import { MockBadge } from '../components/ui/Badge'
import { formatDate } from '../lib/commentStatus'
import { link } from '../components/ui/buttonStyles'

/**
 * Stand-in for an "original document" so Open-source links work in mock mode.
 * Real records link to agency URLs instead.
 */
export function MockDocumentPage() {
  const { permitId = '', sourceId = '' } = useParams()
  const permit = getMockPermit(permitId)
  const source = permit?.sources.find((s) => s.id === sourceId)
  const { hash } = useLocation()
  const targetId = hash.slice(1)

  // The hash target doesn't exist until React renders, so scroll to it ourselves.
  useEffect(() => {
    if (targetId) document.getElementById(targetId)?.scrollIntoView({ block: 'center' })
  }, [targetId, source])

  if (!permit || !source) {
    return <p className="text-slate-700">Document not found. <Link to="/" className={link}>Back to permits</Link></p>
  }

  return (
    <article className="mx-auto max-w-3xl rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
      <div className="rounded-md border border-dashed border-amber-400 bg-amber-50 p-3 text-sm text-amber-900">
        <MockBadge label="Mock document" /> <span className="ml-1">Placeholder text standing in for an original agency document. Not a real record.</span>
      </div>
      <p className="mt-6 text-sm text-slate-500">{source.publisher}{source.date && ` · ${formatDate(source.date)}`} · Permit {permit.permitNumber}</p>
      <h1 className="mt-1 text-2xl font-bold text-slate-900">{source.title}</h1>
      <div className="mt-6 space-y-6">
        {source.passages.map((p, i) => (
          <section key={p.id ?? i} id={p.id ? `passage-${p.id}` : undefined} aria-current={p.id && targetId === `passage-${p.id}` ? 'true' : undefined} className="-mx-3 rounded-md p-3 aria-[current=true]:bg-yellow-100 aria-[current=true]:ring-2 aria-[current=true]:ring-yellow-400">
            <h2 className="text-sm font-semibold text-slate-600">{p.locator}{p.id && targetId === `passage-${p.id}` && <span className="ml-2 font-normal text-yellow-800">— cited passage</span>}</h2>
            <p className="mt-1 font-serif leading-relaxed text-slate-900">{p.text}</p>
          </section>
        ))}
      </div>
      <p className="mt-10 text-sm"><Link to={`/permits/${permit.id}`} className={link}>← Back to permit</Link></p>
    </article>
  )
}
