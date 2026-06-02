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

  it('requires base currency to exist in supportedCurrencies when configured', () => {
    expect(() =>
      normalizeAndValidateSettingsUpdate({
        currency: 'BDT',
        supportedCurrencies: [{ code: 'USD', symbol: '$', rate: 120, name: 'US Dollar' }],
      }),
    ).toThrow(BadRequestException)
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

  it('uses existing currency when update only supplies supportedCurrencies', () => {
    expect(() =>
      normalizeAndValidateSettingsUpdate(
        {
          supportedCurrencies: [{ code: 'USD', symbol: '$', rate: 120, name: 'US Dollar' }],
        },
        { currency: 'BDT', supportedCurrencies: [] },
      ),
    ).toThrow(BadRequestException)
  })

  it('allows an empty supportedCurrencies list', () => {
    const result = normalizeAndValidateSettingsUpdate({
      currency: 'BDT',
      supportedCurrencies: [],
    })

    expect(result.supportedCurrencies).toEqual([])
  })
})
