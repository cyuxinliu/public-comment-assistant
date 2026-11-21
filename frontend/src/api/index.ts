/**
 * API service layer. Components import `api` from here and never call fetch directly.
 *
 * - By default, load the verified shared JSON locally. Questions get live answers when the
 *   user has entered their own Anthropic API key (answer/), else one labeled sample answer.
 * - VITE_USE_MOCKS=true explicitly enables fictional development fixtures.
 * - With VITE_API_BASE_URL set, calls go to the endpoints in docs/api-contract.md.
 */
import { mockAnswer, type MockScenario } from '../mocks/answers'
import { mockPermits } from '../mocks/permits'
import { localAnswer, localPermits } from './local'
import { getApiKey } from '../answer/apiKey'
import { answerQuestion } from '../answer/pipeline'
import type { AIAnswer, AnswerStatus, AskRequest, Permit, PermitSummary } from '../types'

const BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/+$/, '')
export const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true'
export const USE_LOCAL_DATA = !BASE_URL && !USE_MOCKS

export class ApiError extends Error {
  readonly status: number | undefined
  constructor(message: string, status?: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export interface PermitApi {
  listPermits(signal?: AbortSignal): Promise<PermitSummary[]>
  getPermit(id: string, signal?: AbortSignal): Promise<Permit>
  ask(req: AskRequest, signal?: AbortSignal): Promise<AIAnswer>
}

// ---------- HTTP implementation ----------

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      ...init,
      headers: { Accept: 'application/json', ...(init?.body ? { 'Content-Type': 'application/json' } : {}), ...init?.headers },
    })
  } catch (err) {
    if ((err as Error).name === 'AbortError') throw err
    throw new ApiError('Could not reach the server. Check your connection and try again.')
  }
  if (!res.ok) {
    let message = `Request failed (${res.status}).`
    try {
      const body = await res.json()
      if (body?.error?.message) message = body.error.message
    } catch {
      /* non-JSON error body */
    }
    throw new ApiError(message, res.status)
  }
  return res.json() as Promise<T>
}

const ANSWER_STATUSES: AnswerStatus[] = ['answered', 'insufficient_evidence', 'no_evidence', 'needs_clarification']

/** Light runtime check so a malformed backend response shows an error instead of crashing. */
function assertAnswer(data: unknown): AIAnswer {
  const a = data as AIAnswer
  if (!a || !ANSWER_STATUSES.includes(a.status) || !Array.isArray(a.citations)) {
    throw new ApiError('The answer service returned a response in an unexpected format.')
  }
  return { ...a, answer: a.answer ?? '' }
}

const httpApi: PermitApi = {
  listPermits: (signal) => request<{ permits: PermitSummary[] }>('/api/permits', { signal }).then((r) => r.permits),
  getPermit: (id, signal) => request<Permit>(`/api/permits/${encodeURIComponent(id)}`, { signal }),
  ask: ({ permitId, question, scope }, signal) =>
    request<unknown>(`/api/permits/${encodeURIComponent(permitId)}/ask`, {
      method: 'POST',
      body: JSON.stringify({ question, scope }),
      signal,
    }).then(assertAnswer),
}

// ---------- Mock implementation ----------

let mockScenario: MockScenario = 'auto'
export const setMockScenario = (s: MockScenario) => {
  mockScenario = s
}
export const getMockScenario = () => mockScenario

function delay(ms: number, signal?: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    const t = setTimeout(resolve, ms)
    signal?.addEventListener('abort', () => {
      clearTimeout(t)
      reject(new DOMException('Aborted', 'AbortError'))
    })
  })
}

const toSummary = ({ sources: _s, viewpoints: _v, ...summary }: Permit): PermitSummary => summary

const mockApi: PermitApi = {
  async listPermits(signal) {
    await delay(250, signal)
    return mockPermits.map(toSummary)
  },
  async getPermit(id, signal) {
    await delay(250, signal)
    const permit = mockPermits.find((p) => p.id === id)
    if (!permit) throw new ApiError('Permit not found.', 404)
    return structuredClone(permit)
  },
  async ask(req, signal) {
    const scenario = mockScenario
    await delay(scenario === 'slow' ? 6000 : 1200, signal)
    if (scenario === 'error') throw new ApiError('The answer service is unavailable (simulated error).', 503)
    const permit = mockPermits.find((p) => p.id === req.permitId)
    if (!permit) throw new ApiError('Permit not found.', 404)
    return mockAnswer(permit, req, scenario)
  },
}

const localApi: PermitApi = {
  async listPermits() { return localPermits.map(toSummary) },
  async getPermit(id) {
    const permit = localPermits.find(p => p.id === id)
    if (!permit) throw new ApiError('Permit not found.', 404)
    return structuredClone(permit)
  },
  async ask(req, signal) {
    const permit = localPermits.find(p => p.id === req.permitId)
    if (!permit) throw new ApiError('Permit not found.', 404)
    // Live answers only with the user's own key; otherwise the labeled sample.
    const key = getApiKey()
    if (!key) return localAnswer(permit, req)
    // Load the SDK only when someone actually asks with a key.
    const { createClaudeCaller } = await import('../answer/claude')
    return answerQuestion(permit, req, createClaudeCaller(key), signal)
  },
}

export const api: PermitApi = USE_MOCKS ? mockApi : USE_LOCAL_DATA ? localApi : httpApi

/** Mock documents are served by the app itself at /documents/:permitId/:sourceId. */
export const getMockPermit = (id: string) => mockPermits.find((p) => p.id === id)
