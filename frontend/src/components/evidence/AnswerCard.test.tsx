import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import type { AIAnswer, Document } from '../../types'
import { AnswerCard } from './AnswerCard'

const sources: Document[] = [
  { id: 's1', title: 'Draft Permit', url: 'https://agency.example/draft.pdf', scope: 'permit', passages: [{ id: 'p1', locator: 'p. 6', text: 'NOx limit 142.0 tons per year.' }] },
]
const permit = { permitNumber: 'P-1', facilityName: 'Facility', dataStatus: 'verified' as const }
const base: AIAnswer = {
  status: 'answered',
  question: 'More NOx?',
  scope: 'both',
  answer: 'Yes, the limit rises.',
  citations: [{ sourceId: 's1', passageId: 'p1', excerpt: 'NOx limit 142.0 tons per year.', locator: 'p. 6', emissionsKind: 'proposed_limit' }],
}

describe('AnswerCard', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'isSecureContext', { value: true, configurable: true })
  })

  it('shows the answer, excerpt, title, locator, and a link to the original', () => {
    render(<AnswerCard answer={base} sources={sources} permit={permit} />)
    expect(screen.getByText('Yes, the limit rises.')).toBeInTheDocument()
    expect(screen.getByText('“NOx limit 142.0 tons per year.”')).toBeInTheDocument()
    expect(screen.getByText('Draft Permit')).toBeInTheDocument()
    expect(screen.getByText('p. 6')).toBeInTheDocument()
    expect(screen.getByText('Proposed limit')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /open original source/i })).toHaveAttribute('href', 'https://agency.example/draft.pdf')
    expect(screen.getByText(/matches the loaded document/i)).toBeInTheDocument()
  })

  it('copies the excerpt and citation together', async () => {
    const user = userEvent.setup()
    render(<AnswerCard answer={base} sources={sources} permit={permit} />)
    await user.click(screen.getByRole('button', { name: /copy excerpt and citation/i }))
    expect(await screen.findByText('Copied')).toBeInTheDocument()
    const copied = await navigator.clipboard.readText()
    expect(copied).toContain('"NOx limit 142.0 tons per year."')
    expect(copied).toContain('Draft Permit, p. 6')
    expect(copied).toContain('https://agency.example/draft.pdf')
  })

  it('labels sample answers', () => {
    render(<AnswerCard answer={{ ...base, isSample: true }} sources={sources} permit={permit} />)
    expect(screen.getByText('Sample answer')).toBeInTheDocument()
  })

  it('flags insufficient evidence', () => {
    render(<AnswerCard answer={{ ...base, status: 'insufficient_evidence', missingInfo: 'No limits loaded.' }} sources={sources} permit={permit} />)
    expect(screen.getByText('Based on insufficient evidence.')).toBeInTheDocument()
    expect(screen.getByText('No limits loaded.')).toBeInTheDocument()
  })

  it('shows an empty state when no evidence is found', () => {
    render(<AnswerCard answer={{ ...base, status: 'no_evidence', answer: '', citations: [] }} sources={sources} permit={permit} />)
    expect(screen.getByText(/no relevant evidence found/i)).toBeInTheDocument()
  })

  it('warns when an excerpt is not verbatim', () => {
    const altered = { ...base, citations: [{ ...base.citations[0], excerpt: 'NOx limit 200 tons per year.' }] }
    render(<AnswerCard answer={altered} sources={sources} permit={permit} />)
    expect(screen.getByText(/not found word-for-word/i)).toBeInTheDocument()
  })

  it('warns when a citation points to a source that is not in the record', () => {
    const orphan = { ...base, citations: [{ ...base.citations[0], sourceId: 'missing' }] }
    render(<AnswerCard answer={orphan} sources={sources} permit={permit} />)
    expect(screen.getByText(/isn’t in this permit record/)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /copy/i })).not.toBeInTheDocument()
  })
})
