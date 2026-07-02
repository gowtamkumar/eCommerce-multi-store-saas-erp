import {
  DEFAULT_STORE_AI_AUTOMATION,
  StoreAiAutomationConfig,
  StoreAiConfig,
} from '@/common/types/store-ai-config.types'

export function normalizeStoreAiAutomation(
  raw?: StoreAiAutomationConfig | null,
): Required<StoreAiAutomationConfig> {
  return {
    productSeoOnCreate: raw?.productSeoOnCreate ?? DEFAULT_STORE_AI_AUTOMATION.productSeoOnCreate,
    bulkDescriptionOnImport:
      raw?.bulkDescriptionOnImport ?? DEFAULT_STORE_AI_AUTOMATION.bulkDescriptionOnImport,
    abandonedCartDraft:
      raw?.abandonedCartDraft ?? DEFAULT_STORE_AI_AUTOMATION.abandonedCartDraft,
    demandForecastEnabled:
      raw?.demandForecastEnabled ?? DEFAULT_STORE_AI_AUTOMATION.demandForecastEnabled,
  }
}

export function mergeStoreAiAutomation(
  existing: StoreAiAutomationConfig | undefined,
  patch?: StoreAiAutomationConfig,
): Required<StoreAiAutomationConfig> {
  const current = normalizeStoreAiAutomation(existing)
  if (!patch) {
    return current
  }

  return normalizeStoreAiAutomation({
    ...current,
    ...patch,
  })
}

export function isStoreAiAutomationReady(config: StoreAiConfig): boolean {
  return Boolean(config.enabled && config.apiKey?.trim() && config.defaultModel?.trim())
}
