import {
  isTenantAiAutomationReady,
  mergeTenantAiAutomation,
  normalizeTenantAiAutomation,
} from './tenant-ai-automation.util'
import { DEFAULT_TENANT_AI_CONFIG } from '@/common/types/tenant-ai-config.types'

describe('tenant-ai-automation.util', () => {
  it('defaults automation flags when missing', () => {
    expect(normalizeTenantAiAutomation(undefined)).toEqual({
      productSeoOnCreate: false,
      bulkDescriptionOnImport: true,
      abandonedCartDraft: true,
      demandForecastEnabled: false,
    })
  })

  it('merges automation patch', () => {
    expect(
      mergeTenantAiAutomation(undefined, { productSeoOnCreate: true }),
    ).toEqual({
      productSeoOnCreate: true,
      bulkDescriptionOnImport: true,
      abandonedCartDraft: true,
      demandForecastEnabled: false,
    })
  })

  it('detects automation-ready tenant AI config', () => {
    expect(
      isTenantAiAutomationReady({
        ...DEFAULT_TENANT_AI_CONFIG,
        enabled: true,
        apiKey: 'sk-test',
        defaultModel: 'gpt-4o-mini',
      }),
    ).toBe(true)
  })
})
