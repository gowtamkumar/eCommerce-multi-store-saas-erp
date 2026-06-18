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
  hint?: string
}> = [
  {
    id: 'openrouter',
    label: 'OpenRouter',
    baseUrl: 'https://openrouter.ai/api/v1',
    defaultModel: 'openai/gpt-4o-mini',
    embeddingModel: 'openai/text-embedding-3-small',
    hint: 'Access many models with one API key (recommended).',
  },
  {
    id: 'openai',
    label: 'OpenAI',
    baseUrl: 'https://api.openai.com/v1',
    defaultModel: 'gpt-4o-mini',
    embeddingModel: 'text-embedding-3-small',
  },
  {
    id: 'anthropic',
    label: 'Anthropic (via compatible gateway)',
    baseUrl: 'https://openrouter.ai/api/v1',
    defaultModel: 'anthropic/claude-3.5-haiku',
    hint: 'Use OpenRouter or any OpenAI-compatible proxy for Claude models.',
  },
  {
    id: 'azure_openai',
    label: 'Azure OpenAI',
    baseUrl: 'https://YOUR_RESOURCE.openai.azure.com/openai/deployments/YOUR_DEPLOYMENT',
    defaultModel: 'gpt-4o-mini',
    hint: 'Set your Azure deployment URL as the base URL.',
  },
  {
    id: 'google',
    label: 'Google Gemini (via OpenRouter)',
    baseUrl: 'https://openrouter.ai/api/v1',
    defaultModel: 'google/gemini-2.0-flash-001',
  },
  {
    id: 'custom',
    label: 'Custom provider',
    baseUrl: '',
    defaultModel: '',
    hint: 'Any OpenAI-compatible /chat/completions API.',
  },
]

export const DEFAULT_AI_CONFIG_FORM: TenantAiConfigForm = {
  enabled: false,
  provider: 'openrouter',
  apiKey: '',
  baseUrl: AI_PROVIDER_OPTIONS[0].baseUrl,
  defaultModel: AI_PROVIDER_OPTIONS[0].defaultModel,
  embeddingModel: AI_PROVIDER_OPTIONS[0].embeddingModel || '',
  siteUrl: '',
  siteName: '',
  maxTokens: 1024,
  temperature: 0.7,
}
