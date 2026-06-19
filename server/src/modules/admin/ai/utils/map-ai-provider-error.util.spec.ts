import { AxiosError } from 'axios'
import { mapAiProviderError } from './map-ai-provider-error.util'

describe('mapAiProviderError', () => {
  it('maps 401 to API key guidance', () => {
    const error = {
      response: { status: 401, data: { error: { message: 'Invalid API key' } } },
    } as AxiosError

    expect(mapAiProviderError(error)).toContain('API key is invalid or expired')
  })

  it('maps 429 to rate limit guidance', () => {
    const error = {
      response: { status: 429, data: {} },
    } as AxiosError

    expect(mapAiProviderError(error)).toContain('rate limit')
  })

  it('maps 404 to model guidance', () => {
    const error = {
      response: { status: 404, data: { message: 'Model not found' } },
    } as AxiosError

    expect(mapAiProviderError(error)).toContain('model or endpoint was not found')
  })

  it('maps timeout codes', () => {
    const error = { code: 'ETIMEDOUT', message: 'timeout' } as AxiosError
    expect(mapAiProviderError(error)).toContain('timed out')
  })
})
