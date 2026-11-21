import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { PermitListPage } from '../pages/PermitListPage'
import { PermitDetailPage } from '../pages/PermitDetailPage'
import { excerptIsVerbatim } from '../lib/citation'
import { api, USE_LOCAL_DATA } from './index'
import { DEMO_QUESTION, localAnswer, localPermits } from './local'

const permit = localPermits[0]
const request = { permitId: permit.id, question: DEMO_QUESTION, scope: 'both' as const }

describe('verified local permit integration', () => {
  beforeEach(() => {
    Element.prototype.scrollIntoView = vi.fn()
    Object.defineProperty(window, 'isSecureContext', { value: true, configurable: true })
  })
  it('defaults to the shared real record and rejects missing permits', async () => {
    expect(USE_LOCAL_DATA).toBe(true)
    expect((await api.listPermits()).map(p => p.permitNumber)).toEqual(['PAL50'])
    expect(await api.getPermit(permit.id)).toEqual(permit)
    await expect(api.getPermit('missing')).rejects.toMatchObject({ status: 404 })
  })

  it('uses exact, resolvable evidence for the sample without mixing scopes', async () => {
    const answer = await api.ask(request)
    expect(answer.isSample).toBe(true)
    expect(answer.answer).toContain('does not raise the existing NOx cap')
    for (const citation of answer.citations) {
      const source = permit.sources.find(s => s.id === citation.sourceId)!
      expect(source.scope).toBe('permit')
      expect(excerptIsVerbatim(citation, source)).toBe(true)
    }
    const history = localAnswer(permit, { ...request, scope: 'facility_history' })
    expect(history.status).toBe('insufficient_evidence')
    expect(history.citations).toEqual([])
    const unrelated = localAnswer(permit, { ...request, question: 'How much nitrogen oxide was emitted yesterday?' })
    expect(unrelated.status).toBe('needs_clarification')
    expect(unrelated.answer).toBe('')
  })

  it('opens PAL50 from the list, shows status evidence, and copies the real citation', async () => {
    const user = userEvent.setup()
    render(<MemoryRouter><Routes>
      <Route path="/" element={<PermitListPage />} />
      <Route path="/permits/:permitId" element={<PermitDetailPage />} />
    </Routes></MemoryRouter>)
    await user.click(await screen.findByRole('link', { name: /ExxonMobil Beaumont Refinery/i }))
    expect(await screen.findByRole('heading', { name: 'ExxonMobil Beaumont Refinery' })).toBeInTheDocument()
    expect(screen.getByText('Deadline unverified')).toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: /PAL50 Permit Renewal — Final Action/ })[0]).toHaveAttribute('href', permit.sources.find(s => s.id === 'src-final-action')!.url)
    await user.click(screen.getByRole('button', { name: DEMO_QUESTION }))
    await user.click(screen.getByRole('button', { name: 'View sample answer' }))
    expect(await screen.findByText('Sample answer')).toBeInTheDocument()
    const source = permit.sources.find(s => s.id === 'src-technical')!
    expect(screen.getAllByRole('link', { name: /Open original source/ })[0]).toHaveAttribute('href', source.url)
    await user.click(screen.getAllByRole('button', { name: /Copy excerpt and citation/ })[0])
    expect(await screen.findByText('Copied')).toBeInTheDocument()
    const copied = await navigator.clipboard.readText()
    expect(copied).toContain(source.passages[0].text)
    expect(copied).toContain(source.title)
    expect(copied).toContain(source.url)
  })
})
