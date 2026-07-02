import { AiProviderType } from '@/common/types/store-ai-config.types'

export function providerSupportsEmbeddings(provider: string): boolean {
  return provider !== AiProviderType.ANTHROPIC
}

export function resolveEmbeddingConfigWarning(input: {
  enabled: boolean
  provider: string
  embeddingModel?: string | null
  semanticSearchEnabled: boolean
}): string | null {
  if (!input.enabled || !input.semanticSearchEnabled) {
    return null
  }

  if (!providerSupportsEmbeddings(input.provider)) {
    return 'Anthropic does not provide an embeddings API. Use OpenAI, OpenRouter, Google, or Azure OpenAI for semantic search, or turn off semantic search.'
  }

  if (!input.embeddingModel?.trim()) {
    return 'Semantic search is enabled but no embedding model is configured.'
  }

  return null
}
