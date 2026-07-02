import {
  isStoreAiAutomationReady,
  mergeStoreAiAutomation,
  normalizeStoreAiAutomation,
} from './store-ai-automation.util'
import { DEFAULT_STORE_AI_CONFIG } from '@/common/types/store-ai-config.types'

describe('store-ai-automation.util', () => {
  it('defaults automation flags when missing', () => {
    expect(normalizeStoreAiAutomation(undefined)).toEqual({
      productSeoOnCreate: false,
      bulkDescriptionOnImport: true,
      abandonedCartDraft: true,
      demandForecastEnabled: false,
    })
  })

  it('merges automation patch', () => {
    expect(
      mergeStoreAiAutomation(undefined, { productSeoOnCreate: true }),
    ).toEqual({
      productSeoOnCreate: true,
      bulkDescriptionOnImport: true,
      abandonedCartDraft: true,
      demandForecastEnabled: false,
    })
  })

  it('detects automation-ready store AI config', () => {
    expect(
      isStoreAiAutomationReady({
        ...DEFAULT_STORE_AI_CONFIG,
        enabled: true,
        apiKey: 'sk-test',
        defaultModel: 'gpt-4o-mini',
      }),
    ).toBe(true)
  })
})
