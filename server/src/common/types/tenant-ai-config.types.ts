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
  /** Azure OpenAI API version query param */
  apiVersion?: string
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
    label: 'Anthropic',
    baseUrl: 'https://api.anthropic.com/v1',
    defaultModel: 'claude-3-5-haiku-20241022',
  },
  [AiProviderType.AZURE_OPENAI]: {
    label: 'Azure OpenAI',
    baseUrl: 'https://YOUR_RESOURCE.openai.azure.com/openai/deployments/YOUR_DEPLOYMENT',
    defaultModel: 'gpt-4o-mini',
  },
  [AiProviderType.GOOGLE]: {
    label: 'Google Gemini',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
    defaultModel: 'gemini-2.0-flash',
    embeddingModel: 'text-embedding-004',
  },
  [AiProviderType.CUSTOM]: {
    label: 'Custom / Other',
    baseUrl: '',
    defaultModel: '',
  },
}

export const DEFAULT_TENANT_AI_CONFIG: TenantAiConfig = {
  enabled: false,
  provider: AiProviderType.OPENAI,
  baseUrl: AI_PROVIDER_PRESETS[AiProviderType.OPENAI].baseUrl,
  defaultModel: AI_PROVIDER_PRESETS[AiProviderType.OPENAI].defaultModel,
  embeddingModel: AI_PROVIDER_PRESETS[AiProviderType.OPENAI].embeddingModel,
  maxTokens: 1024,
  temperature: 0.7,
}
