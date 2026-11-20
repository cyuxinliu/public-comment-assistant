import type { Citation, Document, Permit } from '../types'
import { formatDate } from './commentStatus'

export const absoluteUrl = (url: string) => {
  try {
    return new URL(url, window.location.origin).toString()
  } catch {
    return url
  }
}

/** Link to the original, jumping to the passage for in-app mock documents. */
export function sourceHref(source: Document, citation?: Citation): string {
  if (source.url.startsWith('/') && citation?.passageId) return `${source.url}#passage-${citation.passageId}`
  return source.url
}

/** Text placed on the clipboard by "Copy excerpt and citation". */
export function formatCitation(citation: Citation, source: Document, permit: Pick<Permit, 'permitNumber' | 'facilityName' | 'dataStatus'>): string {
  const parts = [source.title, citation.locator].filter(Boolean).join(', ')
  const pub = [source.publisher, source.date && formatDate(source.date)].filter(Boolean).join(', ')
  const lines = [
    `"${citation.excerpt}"`,
    `— ${parts}.${pub ? ` ${pub}.` : ''} Permit ${permit.permitNumber}, ${permit.facilityName}.`,
    absoluteUrl(source.url),
  ]
  if (permit.dataStatus === 'mock') lines.push('[MOCK DATA — placeholder, not a real record]')
  return lines.join('\n')
}

const normalize = (s: string) => s.replace(/\s+/g, ' ').trim().toLowerCase()

/** Does the quoted excerpt appear verbatim in the loaded source? */
export function excerptIsVerbatim(citation: Citation, source: Document): boolean {
  const ex = normalize(citation.excerpt)
  if (!ex) return false
  const passages = citation.passageId ? source.passages.filter((p) => p.id === citation.passageId) : source.passages
  return passages.some((p) => normalize(p.text).includes(ex))
}

export async function copyText(text: string): Promise<void> {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text)
    return
  }
  const el = document.createElement('textarea')
  el.value = text
  el.setAttribute('readonly', '')
  el.style.position = 'fixed'
  el.style.opacity = '0'
  document.body.appendChild(el)
  el.select()
  const ok = document.execCommand('copy')
  el.remove()
  if (!ok) throw new Error('Copy failed')
}
