import { describe, expect, it } from 'vitest'
import type { Citation, Document } from '../types'
import { excerptIsVerbatim, formatCitation, sourceHref } from './citation'

const source: Document = {
  id: 'src-tech',
  title: 'Technical Review',
  url: 'https://agency.example/doc.pdf',
  scope: 'permit',
  publisher: 'Agency',
  date: '2026-10-20',
  passages: [
    { id: 't1', locator: 'p. 6', text: 'NOx 142.0 tons per year (proposed).  Currently 118.5.' },
    { id: 't2', locator: 'p. 7', text: 'Other text.' },
  ],
}
const cite = (c: Partial<Citation> = {}): Citation => ({ sourceId: 'src-tech', passageId: 't1', locator: 'p. 6', excerpt: 'NOx 142.0 tons per year (proposed).', ...c })
const permit = { permitNumber: 'P-1', facilityName: 'Facility', dataStatus: 'verified' as const }

describe('formatCitation', () => {
  it('includes the exact excerpt, title, locator, publisher, date, permit, and URL', () => {
    const text = formatCitation(cite(), source, permit)
    expect(text).toBe(
      '"NOx 142.0 tons per year (proposed)."\n' +
        '— Technical Review, p. 6. Agency, October 20, 2026. Permit P-1, Facility.\n' +
        'https://agency.example/doc.pdf',
    )
  })

  it('appends a mock-data notice for mock records', () => {
    expect(formatCitation(cite(), source, { ...permit, dataStatus: 'mock' })).toMatch(/\[MOCK DATA/)
  })

  it('omits publisher/date when the source has none', () => {
    const bare = { ...source, publisher: undefined, date: undefined }
    expect(formatCitation(cite(), bare, permit)).toContain('— Technical Review, p. 6. Permit P-1')
  })
})

describe('excerptIsVerbatim', () => {
  it('accepts an exact substring of the cited passage, ignoring whitespace differences', () => {
    expect(excerptIsVerbatim(cite({ excerpt: 'proposed).   Currently 118.5' }), source)).toBe(true)
  })
  it('rejects altered text', () => {
    expect(excerptIsVerbatim(cite({ excerpt: 'NOx 150 tons per year' }), source)).toBe(false)
  })
  it('only checks the cited passage when passageId is given', () => {
    expect(excerptIsVerbatim(cite({ passageId: 't2' }), source)).toBe(false)
    expect(excerptIsVerbatim(cite({ passageId: undefined }), source)).toBe(true)
  })
  it('rejects an empty excerpt', () => {
    expect(excerptIsVerbatim(cite({ excerpt: '  ' }), source)).toBe(false)
  })
})

describe('sourceHref', () => {
  it('links in-app mock documents to the passage anchor', () => {
    expect(sourceHref({ ...source, url: '/documents/a/b' }, cite())).toBe('/documents/a/b#passage-t1')
  })
  it('leaves external URLs unchanged', () => {
    expect(sourceHref(source, cite())).toBe('https://agency.example/doc.pdf')
  })
})
