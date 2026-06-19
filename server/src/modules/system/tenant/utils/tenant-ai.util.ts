import {
  AI_PROVIDER_PRESETS,
  DEFAULT_TENANT_AI_CONFIG,
  TenantAiConfig,
  TenantAiSensitiveConfig,
  TenantAiStorefrontConfig,
  TenantAiAutomationConfig,
} from '@/common/types/tenant-ai-config.types'
import {
  mergeStorefrontAiConfig,
  normalizeStorefrontAiConfig,
} from '@/common/utils/storefront-ai-config.util'
import {
  mergeTenantAiAutomation,
  normalizeTenantAiAutomation,
} from '@/common/utils/tenant-ai-automation.util'

export const API_KEY_UNCHANGED = '__UNCHANGED__'

export function normalizeSensitiveAiConfig(
  raw?: TenantAiSensitiveConfig | null,
): Required<TenantAiSensitiveConfig> {
  const defaults = DEFAULT_TENANT_AI_CONFIG.sensitive!
  if (!raw || typeof raw !== 'object') return { hrmEnabled: true, financeEnabled: true }
  return {
    hrmEnabled: raw.hrmEnabled ?? defaults.hrmEnabled ?? true,
    financeEnabled: raw.financeEnabled ?? defaults.financeEnabled ?? true,
  }
}

export function normalizeTenantAiConfig(raw?: TenantAiConfig | null): TenantAiConfig {
  if (!raw || typeof raw !== 'object') {
    return { ...DEFAULT_TENANT_AI_CONFIG }
  }

  const provider = raw.provider || DEFAULT_TENANT_AI_CONFIG.provider
  const preset = AI_PROVIDER_PRESETS[provider]

  return {
    enabled: raw.enabled ?? false,
    provider,
    apiKey: raw.apiKey,
    baseUrl: raw.baseUrl || preset?.baseUrl || DEFAULT_TENANT_AI_CONFIG.baseUrl,
    defaultModel: raw.defaultModel || preset?.defaultModel || DEFAULT_TENANT_AI_CONFIG.defaultModel,
    embeddingModel:
      raw.embeddingModel || preset?.embeddingModel || DEFAULT_TENANT_AI_CONFIG.embeddingModel,
    apiVersion: raw.apiVersion || '2024-08-01-preview',
    siteUrl: raw.siteUrl,
    siteName: raw.siteName,
    maxTokens: raw.maxTokens ?? DEFAULT_TENANT_AI_CONFIG.maxTokens,
    temperature: raw.temperature ?? DEFAULT_TENANT_AI_CONFIG.temperature,
    extraHeaders: raw.extraHeaders,
    storefront: normalizeStorefrontAiConfig(raw.storefront),
    automation: normalizeTenantAiAutomation(raw.automation),
    sensitive: normalizeSensitiveAiConfig(raw.sensitive),
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

export function toTenantAiConfigResponse(config: TenantAiConfig): {
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
  storefront: Required<TenantAiStorefrontConfig>
  automation: Required<TenantAiAutomationConfig>
  sensitive: Required<TenantAiSensitiveConfig>
} {
  const normalized = normalizeTenantAiConfig(config)
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
    automation: normalizeTenantAiAutomation(normalized.automation),
    sensitive: normalizeSensitiveAiConfig(normalized.sensitive),
  }
}

export function mergeTenantAiConfigUpdate(
  existing: TenantAiConfig,
  dto: Partial<TenantAiConfig> & { apiKey?: string },
): TenantAiConfig {
  const current = normalizeTenantAiConfig(existing)
  const next: TenantAiConfig = {
    ...current,
    ...dto,
    storefront: dto.storefront
      ? mergeStorefrontAiConfig(current.storefront, dto.storefront)
      : current.storefront,
    automation: dto.automation
      ? mergeTenantAiAutomation(current.automation, dto.automation)
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

  return normalizeTenantAiConfig(next)
}
