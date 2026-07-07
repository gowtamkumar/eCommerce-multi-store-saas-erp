export const AI_API_KEY_UNCHANGED = '__UNCHANGED__'

export type AiProviderId =
  | 'openrouter'
  | 'openai'
  | 'anthropic'
  | 'google'

export interface StoreAiStorefrontConfigForm {
  shoppingAssistantEnabled: boolean
  productQaEnabled: boolean
  semanticSearchEnabled: boolean
}

export interface StoreAiAutomationConfigForm {
  productSeoOnCreate: boolean
  bulkDescriptionOnImport: boolean
  abandonedCartDraft: boolean
  demandForecastEnabled: boolean
}

export interface StoreAiSensitiveConfigForm {
  /** Allow AI for HRM module (leave, recruitment, payroll, performance). Default: true */
  hrmEnabled: boolean
  /** Allow AI for Finance module (AR, AP, tax, expense, ledger). Default: true */
  financeEnabled: boolean
}

export interface StoreAiConfigForm {
  enabled: boolean
  provider: AiProviderId
  apiKey: string
  baseUrl: string
  defaultModel: string
  embeddingModel: string
  siteUrl: string
  siteName: string
  maxTokens: number
  temperature: number
  storefront: StoreAiStorefrontConfigForm
  automation: StoreAiAutomationConfigForm
  sensitive: StoreAiSensitiveConfigForm
  fallback?: StoreAiFallbackConfigForm
}

export interface StoreAiFallbackConfigForm {
  provider: AiProviderId
  apiKey: string
  baseUrl: string
  defaultModel: string
  embeddingModel: string
  siteUrl: string
  siteName: string
}

export interface StoreAiConfigResponse {
  enabled: boolean
  provider: string
  hasApiKey: boolean
  apiKeyPreview: string | null
  baseUrl?: string
  defaultModel?: string
  embeddingModel?: string
  siteUrl?: string
  siteName?: string
  maxTokens?: number
  temperature?: number
  storefront?: StoreAiStorefrontConfigForm
  automation?: StoreAiAutomationConfigForm
  sensitive?: StoreAiSensitiveConfigForm
  fallback?: StoreAiFallbackConfigForm
}

export interface StorefrontAiStatus {
  productQaAvailable: boolean
  shoppingAssistantAvailable: boolean
  semanticSearchAvailable: boolean
  shoppingAssistantEnabled: boolean
  productQaEnabled: boolean
  semanticSearchEnabled: boolean
}

export interface EmbeddingIndexStatus {
  indexedCount: number
  activeProductCount: number
  hybridSearchReady: boolean
  embeddingModel?: string
  embeddingsSupported?: boolean
  embeddingWarning?: string | null
  searchAnalytics?: {
    days: number
    keywordSearches: number
    hybridSearches: number
  }
  assistantAnalytics?: {
    days: number
    chatCount: number
    qaCount: number
    handoffCount: number
  }
}

export function getEmbeddingFormWarning(form: StoreAiConfigForm): string | null {
  if (!form.enabled || !form.storefront.semanticSearchEnabled) {
    return null
  }

  if (form.provider === "anthropic") {
    return "Anthropic does not provide embeddings. Use OpenAI, OpenRouter, Google, or Azure for semantic search, or disable semantic search.";
  }

  if (!form.embeddingModel?.trim()) {
    return "Semantic search is enabled but no embedding model is set.";
  }

  return null;
}

export const DEFAULT_STOREFRONT_AI_CONFIG: StoreAiStorefrontConfigForm = {
  shoppingAssistantEnabled: true,
  productQaEnabled: true,
  semanticSearchEnabled: true,
}

export const DEFAULT_AUTOMATION_AI_CONFIG: StoreAiAutomationConfigForm = {
  productSeoOnCreate: false,
  bulkDescriptionOnImport: true,
  abandonedCartDraft: true,
  demandForecastEnabled: false,
}

export const DEFAULT_SENSITIVE_AI_CONFIG: StoreAiSensitiveConfigForm = {
  hrmEnabled: true,
  financeEnabled: true,
}

export const AI_PROVIDER_OPTIONS: Array<{
  id: AiProviderId
  label: string
  baseUrl: string
  defaultModel: string
  embeddingModel?: string
  apiKeyPlaceholder?: string
  hint?: string
  showOpenRouterHeaders?: boolean
  showEmbeddingModel?: boolean
}> = [
    {
      id: 'openai',
      label: 'OpenAI',
      baseUrl: 'https://api.openai.com/v1',
      defaultModel: 'gpt-4o-mini',
      embeddingModel: 'text-embedding-3-small',
      apiKeyPlaceholder: 'sk-...',
      showEmbeddingModel: true,
    },
    {
      id: 'anthropic',
      label: 'Anthropic',
      baseUrl: 'https://api.anthropic.com/v1',
      defaultModel: 'claude-3-5-haiku-20241022',
      apiKeyPlaceholder: 'sk-ant-...',
      hint: 'Direct Claude API — chat only; semantic search needs OpenAI, OpenRouter, Google, or Azure embeddings.',
      showEmbeddingModel: false,
    },
    {
      id: 'google',
      label: 'Google Gemini',
      baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
      defaultModel: 'gemini-2.0-flash',
      embeddingModel: 'text-embedding-004',
      apiKeyPlaceholder: 'AIza...',
      hint: 'Direct Google AI Studio / Gemini API key.',
      showEmbeddingModel: true,
    },
    {
      id: 'openrouter',
      label: 'OpenRouter',
      baseUrl: 'https://openrouter.ai/api/v1',
      defaultModel: 'openai/gpt-4o-mini',
      embeddingModel: 'openai/text-embedding-3-small',
      apiKeyPlaceholder: 'sk-or-...',
      hint: 'Access many models with one API key.',
      showOpenRouterHeaders: true,
      showEmbeddingModel: true,
    },
  ]

export const DEFAULT_FALLBACK_AI_CONFIG: StoreAiFallbackConfigForm = {
  provider: 'openai',
  apiKey: '',
  baseUrl: AI_PROVIDER_OPTIONS[0].baseUrl,
  defaultModel: AI_PROVIDER_OPTIONS[0].defaultModel,
  embeddingModel: AI_PROVIDER_OPTIONS[0].embeddingModel || '',
  siteUrl: '',
  siteName: '',
}

export const DEFAULT_AI_CONFIG_FORM: StoreAiConfigForm = {
  enabled: false,
  provider: 'openai',
  apiKey: '',
  baseUrl: AI_PROVIDER_OPTIONS[0].baseUrl,
  defaultModel: AI_PROVIDER_OPTIONS[0].defaultModel,
  embeddingModel: AI_PROVIDER_OPTIONS[0].embeddingModel || '',
  siteUrl: '',
  siteName: '',
  maxTokens: 1024,
  temperature: 0.7,
  storefront: { ...DEFAULT_STOREFRONT_AI_CONFIG },
  automation: { ...DEFAULT_AUTOMATION_AI_CONFIG },
  sensitive: { ...DEFAULT_SENSITIVE_AI_CONFIG },
}
