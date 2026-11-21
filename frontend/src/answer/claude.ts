/**
 * Bring-your-own-key model caller. The browser calls the Anthropic API directly with the
 * key the user typed in; no server of ours ever sees it, and nothing bills to the project.
 */
import Anthropic from '@anthropic-ai/sdk'
import type { CallModel } from './pipeline'
import { MODEL_ANSWER_SCHEMA } from './schema'

export const MODEL = 'claude-opus-5-5'

export class AnswerServiceError extends Error {
  readonly status: number | undefined
  constructor(message: string, status?: number) {
    super(message)
    this.name = 'AnswerServiceError'
    this.status = status
  }
}

const abortError = () => new DOMException('Aborted', 'AbortError')

/** Map SDK errors to messages an advocate can act on. Most specific first. */
function friendlyError(err: unknown): Error {
  if (err instanceof Anthropic.APIUserAbortError) return abortError()
  if (err instanceof Anthropic.AuthenticationError) return new AnswerServiceError('Anthropic rejected this API key. Check that it was copied correctly, or remove it and enter a new one.', 401)
  if (err instanceof Anthropic.PermissionDeniedError) return new AnswerServiceError('This API key does not have permission to use the model. Check the key’s workspace settings in the Anthropic Console.', 403)
  if (err instanceof Anthropic.RateLimitError) return new AnswerServiceError('Your API key hit its rate or spend limit. Wait a minute and try again, or check your limits in the Anthropic Console.', 429)
  if (err instanceof Anthropic.BadRequestError) return new AnswerServiceError(`The request was rejected: ${err.message}`, 400)
  if (err instanceof Anthropic.APIConnectionError) return new AnswerServiceError('Could not reach Anthropic. Check your connection and try again.')
  if (err instanceof Anthropic.APIError) return new AnswerServiceError(`The answer service had a problem (${err.status ?? 'unknown'}). Please try again.`, err.status)
  return err instanceof Error ? err : new AnswerServiceError('Something went wrong getting an answer.')
}

export function createClaudeCaller(apiKey: string): CallModel {
  // dangerouslyAllowBrowser: the key belongs to the person using this browser tab.
  const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true, maxRetries: 1 })

  return async ({ system, user }, signal) => {
    let res
    try {
      res = await client.beta.messages.create(
        {
          model: MODEL,
          max_tokens: 16000,
          system,
          messages: [{ role: 'user', content: user }],
          output_config: { effort: 'medium', format: { type: 'json_schema', schema: MODEL_ANSWER_SCHEMA } },
          // If the model declines, the API reroutes to a fallback model within the same call.
          betas: ['server-side-fallback-2026-07-01'],
          fallbacks: 'default',
        },
        { signal },
      )
    } catch (err) {
      if (signal?.aborted) throw abortError()
      throw friendlyError(err)
    }

    if (res.stop_reason === 'refusal') throw new AnswerServiceError('The model declined to answer this question. Try rephrasing it.')
    if (res.stop_reason === 'max_tokens') throw new AnswerServiceError('The answer was cut off before it finished. Try a narrower question.')

    const text = res.content.flatMap((b) => (b.type === 'text' ? [b.text] : [])).join('')
    try {
      return JSON.parse(text) as unknown
    } catch {
      return null // answerQuestion reports a format error
    }
  }
}
