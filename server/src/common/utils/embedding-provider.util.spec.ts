import {
  providerSupportsEmbeddings,
  resolveEmbeddingConfigWarning,
} from './embedding-provider.util'

describe('embedding-provider.util', () => {
  describe('providerSupportsEmbeddings', () => {
    it('returns false for anthropic', () => {
      expect(providerSupportsEmbeddings('anthropic')).toBe(false)
    })

    it('returns true for embedding-capable providers', () => {
      expect(providerSupportsEmbeddings('openai')).toBe(true)
      expect(providerSupportsEmbeddings('openrouter')).toBe(true)
    })
  })

  describe('resolveEmbeddingConfigWarning', () => {
    it('returns null when semantic search is off', () => {
      expect(
        resolveEmbeddingConfigWarning({
          enabled: true,
          provider: 'anthropic',
          semanticSearchEnabled: false,
        }),
      ).toBeNull()
    })

    it('warns when anthropic is selected with semantic search on', () => {
      expect(
        resolveEmbeddingConfigWarning({
          enabled: true,
          provider: 'anthropic',
          semanticSearchEnabled: true,
        }),
      ).toContain('Anthropic')
    })

    it('warns when embedding model is missing', () => {
      expect(
        resolveEmbeddingConfigWarning({
          enabled: true,
          provider: 'openai',
          embeddingModel: '',
          semanticSearchEnabled: true,
        }),
      ).toContain('embedding model')
    })

    it('returns null for a valid openai configuration', () => {
      expect(
        resolveEmbeddingConfigWarning({
          enabled: true,
          provider: 'openai',
          embeddingModel: 'text-embedding-3-small',
          semanticSearchEnabled: true,
        }),
      ).toBeNull()
    })
  })
})
