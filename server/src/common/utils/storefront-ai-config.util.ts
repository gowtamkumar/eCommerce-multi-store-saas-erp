import {
  DEFAULT_STORE_AI_CONFIG,
  StoreAiConfig,
  StoreAiStorefrontConfig,
} from '@/common/types/store-ai-config.types'

export const DEFAULT_STOREFRONT_AI_CONFIG: Required<StoreAiStorefrontConfig> = {
  shoppingAssistantEnabled: true,
  productQaEnabled: true,
  semanticSearchEnabled: true,
}

export function normalizeStorefrontAiConfig(
  raw?: StoreAiStorefrontConfig | null,
): Required<StoreAiStorefrontConfig> {
  return {
    shoppingAssistantEnabled: raw?.shoppingAssistantEnabled !== false,
    productQaEnabled: raw?.productQaEnabled !== false,
    semanticSearchEnabled: raw?.semanticSearchEnabled !== false,
  }
}

export function isStoreAiProviderReady(config: StoreAiConfig): boolean {
  return Boolean(
    config.enabled && config.apiKey?.trim() && config.defaultModel?.trim(),
  )
}

export function mergeStorefrontAiConfig(
  current?: StoreAiStorefrontConfig | null,
  patch?: StoreAiStorefrontConfig | null,
): Required<StoreAiStorefrontConfig> {
  return normalizeStorefrontAiConfig({
    ...DEFAULT_STORE_AI_CONFIG.storefront,
    ...current,
    ...patch,
  })
}
