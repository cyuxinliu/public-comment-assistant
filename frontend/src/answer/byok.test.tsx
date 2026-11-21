import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DEMO_QUESTION } from '../api/local'
import { PermitDetailPage } from '../pages/PermitDetailPage'
import { clearApiKey, getApiKey, setApiKey } from './apiKey'
import type { CallModel } from './pipeline'

const KEY = 'sk-ant-test-0123456789abcdefghijklmnop'

// Never call the real API from tests: replace the browser caller with a fake.
const fake = vi.hoisted(() => ({ keys: [] as string[], call: null as unknown as CallModel }))
vi.mock('./claude', () => ({
  createClaudeCaller: (key: string) => {
    fake.keys.push(key)
    return fake.call
  },
}))

const renderPal50 = () =>
  render(<MemoryRouter initialEntries={['/permits/exxonmobil-beaumont-pal50-renewal']}><Routes>
    <Route path="/permits/:permitId" element={<PermitDetailPage />} />
  </Routes></MemoryRouter>)

describe('bring your own key', () => {
  beforeEach(() => {
    Element.prototype.scrollIntoView = vi.fn()
    fake.keys = []
    fake.call = async () => ({
      status: 'answered',
      answer: 'The proposed NOx limit is unchanged at 2,088.19 tons per year.',
      citations: [{ sourceId: 'src-technical', passageId: 't2' }],
      missingInfo: null,
      clarifyingQuestion: null,
      suggestedQuestions: [],
    })
  })
  afterEach(() => act(() => clearApiKey()))

  it('stores the key only in memory unless asked to remember it for the tab', () => {
    act(() => setApiKey(KEY, false))
    expect(getApiKey()).toBe(KEY)
    expect(sessionStorage.getItem('pca.anthropicApiKey')).toBeNull()
    act(() => setApiKey(KEY, true))
    expect(sessionStorage.getItem('pca.anthropicApiKey')).toBe(KEY)
    expect(localStorage.length).toBe(0)
    act(() => clearApiKey())
    expect(getApiKey()).toBeNull()
    expect(sessionStorage.getItem('pca.anthropicApiKey')).toBeNull()
  })

  it('rejects text that is not an API key', async () => {
    const user = userEvent.setup()
    renderPal50()
    await user.type(await screen.findByLabelText('Anthropic API key'), 'my-password')
    await user.click(screen.getByRole('button', { name: 'Use key' }))
    expect(screen.getByText(/doesn’t look like an Anthropic API key/)).toBeInTheDocument()
    expect(getApiKey()).toBeNull()
  })

  it('switches from the sample to live, grounded answers once a key is entered', async () => {
    const user = userEvent.setup()
    renderPal50()
    expect(await screen.findByRole('button', { name: 'View sample answer' })).toBeInTheDocument()

    await user.type(screen.getByLabelText('Anthropic API key'), KEY)
    await user.click(screen.getByRole('button', { name: 'Use key' }))
    expect(screen.getByText('Live answers on.')).toBeInTheDocument()
    expect(screen.getByText('…mnop')).toBeInTheDocument()

    await user.type(screen.getByLabelText('Your question'), DEMO_QUESTION)
    await user.click(screen.getByRole('button', { name: 'Ask' }))
    expect(await screen.findByText(/unchanged at 2,088.19/)).toBeInTheDocument()
    expect(screen.queryByText('Sample answer')).not.toBeInTheDocument()
    expect(fake.keys).toEqual([KEY])

    await user.click(screen.getByRole('button', { name: 'Remove key' }))
    expect(screen.getByRole('button', { name: 'View sample answer' })).toBeInTheDocument()
  })

  it('shows service errors instead of an answer', async () => {
    fake.call = async () => { throw new Error('Anthropic rejected this API key.') }
    const user = userEvent.setup()
    act(() => setApiKey(KEY, false))
    renderPal50()
    await user.type(await screen.findByLabelText('Your question'), DEMO_QUESTION)
    await user.click(screen.getByRole('button', { name: 'Ask' }))
    expect(await screen.findByText('Anthropic rejected this API key.')).toBeInTheDocument()
  })
})
