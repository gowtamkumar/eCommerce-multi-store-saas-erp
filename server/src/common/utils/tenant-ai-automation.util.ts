import {
  DEFAULT_TENANT_AI_AUTOMATION,
  TenantAiAutomationConfig,
  TenantAiConfig,
} from '@/common/types/tenant-ai-config.types'

export function normalizeTenantAiAutomation(
  raw?: TenantAiAutomationConfig | null,
): Required<TenantAiAutomationConfig> {
  return {
    productSeoOnCreate: raw?.productSeoOnCreate ?? DEFAULT_TENANT_AI_AUTOMATION.productSeoOnCreate,
    abandonedCartDraft:
      raw?.abandonedCartDraft ?? DEFAULT_TENANT_AI_AUTOMATION.abandonedCartDraft,
    demandForecastEnabled:
      raw?.demandForecastEnabled ?? DEFAULT_TENANT_AI_AUTOMATION.demandForecastEnabled,
  }
}

export function mergeTenantAiAutomation(
  existing: TenantAiAutomationConfig | undefined,
  patch?: TenantAiAutomationConfig,
): Required<TenantAiAutomationConfig> {
  const current = normalizeTenantAiAutomation(existing)
  if (!patch) {
    return current
  }

  return normalizeTenantAiAutomation({
    ...current,
    ...patch,
  })
}

export function isTenantAiAutomationReady(config: TenantAiConfig): boolean {
  return Boolean(config.enabled && config.apiKey?.trim() && config.defaultModel?.trim())
}
