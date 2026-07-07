import {
  AI_PROVIDER_PRESETS,
  DEFAULT_STORE_AI_CONFIG,
  StoreAiConfig,
  StoreAiFallbackConfig,
  StoreAiSensitiveConfig,
  StoreAiStorefrontConfig,
  StoreAiAutomationConfig,
} from '@/common/types/store-ai-config.types'
import {
  mergeStorefrontAiConfig,
  normalizeStorefrontAiConfig,
} from '@/common/utils/storefront-ai-config.util'
import {
  mergeStoreAiAutomation,
  normalizeStoreAiAutomation,
} from '@/common/utils/store-ai-automation.util'

export const API_KEY_UNCHANGED = '__UNCHANGED__'

export function normalizeSensitiveAiConfig(
  raw?: StoreAiSensitiveConfig | null,
): Required<StoreAiSensitiveConfig> {
  const defaults = DEFAULT_STORE_AI_CONFIG.sensitive!
  if (!raw || typeof raw !== 'object') return { hrmEnabled: true, financeEnabled: true }
  return {
    hrmEnabled: raw.hrmEnabled ?? defaults.hrmEnabled ?? true,
    financeEnabled: raw.financeEnabled ?? defaults.financeEnabled ?? true,
  }
}

export function normalizeFallbackConfig(
  raw: StoreAiFallbackConfig,
  primaryProvider: string,
): StoreAiFallbackConfig {
  const provider = raw.provider || primaryProvider
  const preset = AI_PROVIDER_PRESETS[provider]
  return {
    provider,
    apiKey: raw.apiKey,
    baseUrl: raw.baseUrl || preset?.baseUrl,
    defaultModel: raw.defaultModel || preset?.defaultModel,
    embeddingModel: raw.embeddingModel || preset?.embeddingModel,
    apiVersion: raw.apiVersion,
    siteUrl: raw.siteUrl,
    siteName: raw.siteName,
    extraHeaders: raw.extraHeaders,
  }
}

export function normalizeStoreAiConfig(raw?: StoreAiConfig | null): StoreAiConfig {
  if (!raw || typeof raw !== 'object') {
    return { ...DEFAULT_STORE_AI_CONFIG }
  }

  const provider = raw.provider || DEFAULT_STORE_AI_CONFIG.provider
  const preset = AI_PROVIDER_PRESETS[provider]

  return {
    enabled: raw.enabled ?? false,
    provider,
    apiKey: raw.apiKey,
    baseUrl: raw.baseUrl || preset?.baseUrl || DEFAULT_STORE_AI_CONFIG.baseUrl,
    defaultModel: raw.defaultModel || preset?.defaultModel || DEFAULT_STORE_AI_CONFIG.defaultModel,
    embeddingModel:
      raw.embeddingModel || preset?.embeddingModel || DEFAULT_STORE_AI_CONFIG.embeddingModel,
    apiVersion: raw.apiVersion || '2024-08-01-preview',
    siteUrl: raw.siteUrl,
    siteName: raw.siteName,
    maxTokens: raw.maxTokens ?? DEFAULT_STORE_AI_CONFIG.maxTokens,
    temperature: raw.temperature ?? DEFAULT_STORE_AI_CONFIG.temperature,
    extraHeaders: raw.extraHeaders,
    storefront: normalizeStorefrontAiConfig(raw.storefront),
    automation: normalizeStoreAiAutomation(raw.automation),
    sensitive: normalizeSensitiveAiConfig(raw.sensitive),
    fallback: raw.fallback && typeof raw.fallback === 'object'
      ? normalizeFallbackConfig(raw.fallback, provider)
      : undefined,
  }
}

export function maskApiKey(apiKey?: string): { hasApiKey: boolean; apiKeyPreview: string | null } {
  if (!apiKey?.trim()) {
    return { hasApiKey: false, apiKeyPreview: null }
  }
  const trimmed = apiKey.trim()
  if (trimmed.length <= 8) {
    return { hasApiKey: true, apiKeyPreview: '••••••••' }
  }
  return {
    hasApiKey: true,
    apiKeyPreview: `${trimmed.slice(0, 4)}...${trimmed.slice(-4)}`,
  }
}

export function toStoreAiConfigResponse(config: StoreAiConfig): {
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
  extraHeaders?: Record<string, string>
  storefront: Required<StoreAiStorefrontConfig>
  automation: Required<StoreAiAutomationConfig>
  sensitive: Required<StoreAiSensitiveConfig>
  fallback?: StoreAiFallbackConfig
} {
  const normalized = normalizeStoreAiConfig(config)
  const { hasApiKey, apiKeyPreview } = maskApiKey(normalized.apiKey)

  return {
    enabled: normalized.enabled,
    provider: normalized.provider,
    hasApiKey,
    apiKeyPreview,
    baseUrl: normalized.baseUrl,
    defaultModel: normalized.defaultModel,
    embeddingModel: normalized.embeddingModel,
    apiVersion: normalized.apiVersion,
    siteUrl: normalized.siteUrl,
    siteName: normalized.siteName,
    maxTokens: normalized.maxTokens,
    temperature: normalized.temperature,
    extraHeaders: normalized.extraHeaders,
    storefront: normalizeStorefrontAiConfig(normalized.storefront),
    automation: normalizeStoreAiAutomation(normalized.automation),
    sensitive: normalizeSensitiveAiConfig(normalized.sensitive),
    fallback: normalized.fallback,
  }
}

export function mergeStoreAiConfigUpdate(
  existing: StoreAiConfig,
  dto: Partial<StoreAiConfig> & { apiKey?: string },
): StoreAiConfig {
  const current = normalizeStoreAiConfig(existing)
  const next: StoreAiConfig = {
    ...current,
    ...dto,
    storefront: dto.storefront
      ? mergeStorefrontAiConfig(current.storefront, dto.storefront)
      : current.storefront,
    automation: dto.automation
      ? mergeStoreAiAutomation(current.automation, dto.automation)
      : current.automation,
    sensitive: dto.sensitive
      ? { ...normalizeSensitiveAiConfig(current.sensitive), ...dto.sensitive }
      : current.sensitive,
  }

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
    if (preset?.embeddingModel && !dto.embeddingModel) {
      next.embeddingModel = preset.embeddingModel
    }
  }

  return normalizeStoreAiConfig(next)
}
