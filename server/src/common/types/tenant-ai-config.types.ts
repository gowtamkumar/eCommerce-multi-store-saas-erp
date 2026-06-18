export enum AiProviderType {
  OPENROUTER = 'openrouter',
  OPENAI = 'openai',
  ANTHROPIC = 'anthropic',
  AZURE_OPENAI = 'azure_openai',
  GOOGLE = 'google',
  CUSTOM = 'custom',
}

export interface TenantAiConfig {
  enabled: boolean
  provider: AiProviderType | string
  apiKey?: string
  baseUrl?: string
  defaultModel?: string
  embeddingModel?: string
  siteUrl?: string
  siteName?: string
  maxTokens?: number
  temperature?: number
  extraHeaders?: Record<string, string>
}

export const AI_PROVIDER_PRESETS: Record<
  string,
  { label: string; baseUrl: string; defaultModel: string; embeddingModel?: string }
> = {
  [AiProviderType.OPENROUTER]: {
    label: 'OpenRouter',
    baseUrl: 'https://openrouter.ai/api/v1',
    defaultModel: 'openai/gpt-4o-mini',
    embeddingModel: 'openai/text-embedding-3-small',
  },
  [AiProviderType.OPENAI]: {
    label: 'OpenAI',
    baseUrl: 'https://api.openai.com/v1',
    defaultModel: 'gpt-4o-mini',
    embeddingModel: 'text-embedding-3-small',
  },
  [AiProviderType.ANTHROPIC]: {
    label: 'Anthropic (OpenAI-compatible proxy)',
    baseUrl: 'https://openrouter.ai/api/v1',
    defaultModel: 'anthropic/claude-3.5-haiku',
  },
  [AiProviderType.AZURE_OPENAI]: {
    label: 'Azure OpenAI',
    baseUrl: 'https://YOUR_RESOURCE.openai.azure.com/openai/deployments/YOUR_DEPLOYMENT',
    defaultModel: 'gpt-4o-mini',
  },
  [AiProviderType.GOOGLE]: {
    label: 'Google Gemini (via OpenRouter)',
    baseUrl: 'https://openrouter.ai/api/v1',
    defaultModel: 'google/gemini-2.0-flash-001',
  },
  [AiProviderType.CUSTOM]: {
    label: 'Custom / Other',
    baseUrl: '',
    defaultModel: '',
  },
}

export const DEFAULT_TENANT_AI_CONFIG: TenantAiConfig = {
  enabled: false,
  provider: AiProviderType.OPENROUTER,
  baseUrl: AI_PROVIDER_PRESETS[AiProviderType.OPENROUTER].baseUrl,
  defaultModel: AI_PROVIDER_PRESETS[AiProviderType.OPENROUTER].defaultModel,
  embeddingModel: AI_PROVIDER_PRESETS[AiProviderType.OPENROUTER].embeddingModel,
  maxTokens: 1024,
  temperature: 0.7,
}
