import {
  AI_PROVIDER_PRESETS,
  AiProviderType,
} from '@/common/types/tenant-ai-config.types'
import {
  DEFAULT_PLATFORM_AI_CONFIG,
  PlatformAiConfig,
} from '@/common/types/platform-ai-config.types'
import { API_KEY_UNCHANGED, maskApiKey } from '@/modules/system/tenant/utils/tenant-ai.util'

export { API_KEY_UNCHANGED }

export function normalizePlatformAiConfig(raw?: PlatformAiConfig | null): PlatformAiConfig {
  if (!raw || typeof raw !== 'object') {
    return { ...DEFAULT_PLATFORM_AI_CONFIG }
  }

  const provider = raw.provider || DEFAULT_PLATFORM_AI_CONFIG.provider
  const preset = AI_PROVIDER_PRESETS[provider]

  return {
    enabled: raw.enabled ?? false,
    provider,
    apiKey: raw.apiKey,
    baseUrl: raw.baseUrl || preset?.baseUrl || DEFAULT_PLATFORM_AI_CONFIG.baseUrl,
    defaultModel:
      raw.defaultModel || preset?.defaultModel || DEFAULT_PLATFORM_AI_CONFIG.defaultModel,
    apiVersion: raw.apiVersion || '2024-08-01-preview',
    siteUrl: raw.siteUrl,
    siteName: raw.siteName,
    maxTokens: raw.maxTokens ?? DEFAULT_PLATFORM_AI_CONFIG.maxTokens,
    temperature: raw.temperature ?? DEFAULT_PLATFORM_AI_CONFIG.temperature,
    extraHeaders: raw.extraHeaders,
  }
}

export function isPlatformAiProviderReady(config: PlatformAiConfig): boolean {
  const normalized = normalizePlatformAiConfig(config)
  return Boolean(
    normalized.enabled && normalized.apiKey?.trim() && normalized.defaultModel?.trim(),
  )
}

export function toPlatformAiConfigResponse(config: PlatformAiConfig | null | undefined) {
  const normalized = normalizePlatformAiConfig(config)
  const { hasApiKey, apiKeyPreview } = maskApiKey(normalized.apiKey)

  return {
    enabled: normalized.enabled,
    provider: normalized.provider,
    hasApiKey,
    apiKeyPreview,
    baseUrl: normalized.baseUrl,
    defaultModel: normalized.defaultModel,
    apiVersion: normalized.apiVersion,
    siteUrl: normalized.siteUrl,
    siteName: normalized.siteName,
    maxTokens: normalized.maxTokens,
    temperature: normalized.temperature,
    extraHeaders: normalized.extraHeaders,
  }
}

export function mergePlatformAiConfigUpdate(
  existing: PlatformAiConfig | null | undefined,
  dto: Partial<PlatformAiConfig> & { apiKey?: string },
): PlatformAiConfig {
  const current = normalizePlatformAiConfig(existing)
  const next: PlatformAiConfig = { ...current, ...dto }

  if (
    dto.apiKey === undefined ||
    dto.apiKey === '' ||
    dto.apiKey === API_KEY_UNCHANGED
  ) {
    next.apiKey = current.apiKey
  }

  if (dto.provider && dto.provider !== current.provider && !dto.baseUrl) {
    const preset = AI_PROVIDER_PRESETS[dto.provider]
    if (preset?.baseUrl) {
      next.baseUrl = preset.baseUrl
    }
    if (preset?.defaultModel && !dto.defaultModel) {
      next.defaultModel = preset.defaultModel
    }
  }

  return normalizePlatformAiConfig(next)
}

export function resolvePlatformAiConfigFromEnv(env: {
  apiKey?: string
  baseUrl?: string
  model?: string
}): PlatformAiConfig | null {
  if (!env.apiKey?.trim() || !env.model?.trim()) {
    return null
  }

  return normalizePlatformAiConfig({
    enabled: true,
    provider: AiProviderType.OPENAI,
    apiKey: env.apiKey.trim(),
    baseUrl: env.baseUrl?.trim() || DEFAULT_PLATFORM_AI_CONFIG.baseUrl,
    defaultModel: env.model.trim(),
  })
}
