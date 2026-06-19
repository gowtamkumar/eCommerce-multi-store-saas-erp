import { AxiosError } from 'axios'

export function mapAiProviderError(error: unknown): string {
  const axiosError = error as AxiosError<{
    error?: { message?: string; code?: string }
    message?: string
  }>

  const status = axiosError.response?.status
  const providerMessage =
    axiosError.response?.data?.error?.message ||
    axiosError.response?.data?.message ||
    axiosError.message ||
    'AI provider request failed'

  if (status === 401) {
    return 'AI API key is invalid or expired. Update it under Settings → AI.'
  }

  if (status === 403) {
    return 'AI provider rejected the request. Check API key permissions and billing.'
  }

  if (status === 404) {
    return 'AI model or endpoint was not found. Verify the model name and base URL in Settings → AI.'
  }

  if (status === 429) {
    return 'AI provider rate limit reached. Wait a moment and try again.'
  }

  if (status === 400) {
    const lower = providerMessage.toLowerCase()
    if (lower.includes('model') && (lower.includes('not found') || lower.includes('does not exist'))) {
      return 'The configured AI model was not found. Choose a valid model in Settings → AI.'
    }
    return `AI provider rejected the request: ${providerMessage}`
  }

  if (axiosError.code === 'ECONNABORTED' || axiosError.code === 'ETIMEDOUT') {
    return 'AI provider request timed out. Try again with a shorter prompt or check provider status.'
  }

  if (!status && axiosError.message) {
    return `AI provider is unreachable: ${axiosError.message}`
  }

  return providerMessage
}
