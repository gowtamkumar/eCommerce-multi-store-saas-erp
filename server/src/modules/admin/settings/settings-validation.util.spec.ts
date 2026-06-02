import { BadRequestException } from '@nestjs/common'
import { normalizeAndValidateSettingsUpdate } from './settings-validation.util'

describe('settings-validation.util', () => {
  it('normalizes currency codes to uppercase', () => {
    const result = normalizeAndValidateSettingsUpdate({
      currency: 'bdt',
      supportedCurrencies: [{ code: 'bdt', symbol: '৳', rate: 1, name: 'Bangladeshi Taka' }],
    })

    expect(result.currency).toBe('BDT')
    expect(result.supportedCurrencies?.[0].code).toBe('BDT')
  })

  it('automatically appends base currency to supportedCurrencies if missing', () => {
    const result = normalizeAndValidateSettingsUpdate({
      currency: 'BDT',
      supportedCurrencies: [{ code: 'USD', symbol: '$', rate: 120, name: 'US Dollar' }],
    })

    expect(result.supportedCurrencies?.length).toBe(2)
    expect(result.supportedCurrencies?.[1]).toEqual({
      code: 'BDT',
      symbol: '৳',
      rate: 1,
      name: 'Bangladeshi Taka',
    })
  })

  it('rejects duplicate supported currency codes', () => {
    expect(() =>
      normalizeAndValidateSettingsUpdate({
        currency: 'BDT',
        supportedCurrencies: [
          { code: 'BDT', symbol: '৳', rate: 1, name: 'Bangladeshi Taka' },
          { code: 'bdt', symbol: '৳', rate: 1, name: 'Bangladeshi Taka' },
        ],
      }),
    ).toThrow(BadRequestException)
  })

  it('uses existing currency and appends it when update only supplies supportedCurrencies', () => {
    const result = normalizeAndValidateSettingsUpdate(
      {
        supportedCurrencies: [{ code: 'USD', symbol: '$', rate: 120, name: 'US Dollar' }],
      },
      { currency: 'BDT', supportedCurrencies: [] },
    )

    expect(result.supportedCurrencies?.length).toBe(2)
    expect(result.supportedCurrencies?.[1]).toEqual({
      code: 'BDT',
      symbol: '৳',
      rate: 1,
      name: 'Bangladeshi Taka',
    })
  })

  it('allows an empty supportedCurrencies list', () => {
    const result = normalizeAndValidateSettingsUpdate({
      currency: 'BDT',
      supportedCurrencies: [],
    })

    expect(result.supportedCurrencies).toEqual([])
  })

  it('normalizes defaultBranchId empty string to null', () => {
    const result = normalizeAndValidateSettingsUpdate({
      defaultBranchId: '',
    })

    expect(result.defaultBranchId).toBeNull()
  })

  it('keeps defaultBranchId undefined if not supplied', () => {
    const result = normalizeAndValidateSettingsUpdate({})

    expect(result.defaultBranchId).toBeUndefined()
  })
})
