export const AI_API_KEY_UNCHANGED = '__UNCHANGED__'

export type AiProviderId =
  | 'openrouter'
  | 'openai'
  | 'anthropic'
  | 'azure_openai'
  | 'google'
  | 'custom'

export interface TenantAiConfigForm {
  enabled: boolean
  provider: AiProviderId
  apiKey: string
  baseUrl: string
  defaultModel: string
  embeddingModel: string
  apiVersion: string
  siteUrl: string
  siteName: string
  maxTokens: number
  temperature: number
}

export interface TenantAiConfigResponse {
  enabled: boolean
  provider: string
  hasApiKey: boolean
  apiKeyPreview: string | null
  baseUrl?: string
  defaultModel?: string
  embeddingModel?: string
  apiVersion?: string
  siteUrl?: string
  siteName?: string
  maxTokens?: number
  temperature?: number
}

export const AI_PROVIDER_OPTIONS: Array<{
  id: AiProviderId
  label: string
  baseUrl: string
  defaultModel: string
  embeddingModel?: string
  apiVersion?: string
  apiKeyPlaceholder?: string
  hint?: string
  showOpenRouterHeaders?: boolean
  showEmbeddingModel?: boolean
  showApiVersion?: boolean
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
    hint: 'Direct Claude API — use your Anthropic API key.',
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
    id: 'azure_openai',
    label: 'Azure OpenAI',
    baseUrl: 'https://YOUR_RESOURCE.openai.azure.com/openai/deployments/YOUR_DEPLOYMENT',
    defaultModel: 'gpt-4o-mini',
    apiVersion: '2024-08-01-preview',
    apiKeyPlaceholder: 'Azure API key',
    hint: 'Set base URL to your deployment endpoint (resource + deployment name).',
    showApiVersion: true,
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
  {
    id: 'custom',
    label: 'Custom provider',
    baseUrl: '',
    defaultModel: '',
    apiKeyPlaceholder: 'API key',
    hint: 'Any OpenAI-compatible /chat/completions API.',
    showEmbeddingModel: true,
  },
]

export const DEFAULT_AI_CONFIG_FORM: TenantAiConfigForm = {
  enabled: false,
  provider: 'openai',
  apiKey: '',
  baseUrl: AI_PROVIDER_OPTIONS[0].baseUrl,
  defaultModel: AI_PROVIDER_OPTIONS[0].defaultModel,
  embeddingModel: AI_PROVIDER_OPTIONS[0].embeddingModel || '',
  apiVersion: AI_PROVIDER_OPTIONS[0].apiVersion || '2024-08-01-preview',
  siteUrl: '',
  siteName: '',
  maxTokens: 1024,
  temperature: 0.7,
}
