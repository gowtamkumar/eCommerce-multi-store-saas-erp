import {
  DEFAULT_TENANT_AI_CONFIG,
  TenantAiConfig,
  TenantAiStorefrontConfig,
} from '@/common/types/tenant-ai-config.types'

export const DEFAULT_STOREFRONT_AI_CONFIG: Required<TenantAiStorefrontConfig> = {
  shoppingAssistantEnabled: true,
  productQaEnabled: true,
  semanticSearchEnabled: true,
}

export function normalizeStorefrontAiConfig(
  raw?: TenantAiStorefrontConfig | null,
): Required<TenantAiStorefrontConfig> {
  return {
    shoppingAssistantEnabled: raw?.shoppingAssistantEnabled !== false,
    productQaEnabled: raw?.productQaEnabled !== false,
    semanticSearchEnabled: raw?.semanticSearchEnabled !== false,
  }
}

export function isTenantAiProviderReady(config: TenantAiConfig): boolean {
  return Boolean(
    config.enabled && config.apiKey?.trim() && config.defaultModel?.trim(),
  )
}

export function mergeStorefrontAiConfig(
  current?: TenantAiStorefrontConfig | null,
  patch?: TenantAiStorefrontConfig | null,
): Required<TenantAiStorefrontConfig> {
  return normalizeStorefrontAiConfig({
    ...DEFAULT_TENANT_AI_CONFIG.storefront,
    ...current,
    ...patch,
  })
}
