import { AiProviderType } from '@/common/types/tenant-ai-config.types'

export interface PlatformAiConfig {
  enabled: boolean
  provider: AiProviderType | string
  apiKey?: string
  baseUrl?: string
  defaultModel?: string
  apiVersion?: string
  siteUrl?: string
  siteName?: string
  maxTokens?: number
  temperature?: number
  extraHeaders?: Record<string, string>
}

export const DEFAULT_PLATFORM_AI_CONFIG: PlatformAiConfig = {
  enabled: false,
  provider: AiProviderType.OPENAI,
  baseUrl: 'https://api.openai.com/v1',
  defaultModel: 'gpt-4o-mini',
  maxTokens: 1024,
  temperature: 0.7,
}
