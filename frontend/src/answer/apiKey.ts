/**
 * Holds the user's own Anthropic API key for this browser tab.
 *
 * - Default: memory only (gone on reload).
 * - "Remember for this tab": sessionStorage (gone when the tab closes).
 * - Never localStorage, never sent anywhere except api.anthropic.com.
 */
import { useSyncExternalStore } from 'react'

const STORAGE_KEY = 'pca.anthropicApiKey'
const listeners = new Set<() => void>()

function readStored(): string | null {
  try {
    return sessionStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

let apiKey: string | null = readStored()

const emit = () => listeners.forEach((l) => l())

export const getApiKey = () => apiKey

export function setApiKey(key: string, remember: boolean) {
  apiKey = key.trim() || null
  try {
    if (apiKey && remember) sessionStorage.setItem(STORAGE_KEY, apiKey)
    else sessionStorage.removeItem(STORAGE_KEY)
  } catch {
    /* storage blocked: memory only */
  }
  emit()
}

export function clearApiKey() {
  apiKey = null
  try {
    sessionStorage.removeItem(STORAGE_KEY)
  } catch {
    /* ignore */
  }
  emit()
}

/** Shape check only; Anthropic validates the key on first use. */
export const looksLikeApiKey = (k: string) => /^sk-ant-[A-Za-z0-9_-]{20,}$/.test(k.trim())

export const maskKey = (k: string) => `…${k.slice(-4)}`

function subscribe(l: () => void) {
  listeners.add(l)
  return () => listeners.delete(l)
}

export const useApiKey = () => useSyncExternalStore(subscribe, getApiKey, getApiKey)
