import { getSymbolForCurrency, getCurrencyName, getLocaleForCountry } from './localization.util'

describe('Localization Utils', () => {
  describe('getSymbolForCurrency', () => {
    it('should return correct symbols for known currencies', () => {
      expect(getSymbolForCurrency('USD')).toBe('$')
      expect(getSymbolForCurrency('GBP')).toBe('£')
      expect(getSymbolForCurrency('EUR')).toBe('€')
      expect(getSymbolForCurrency('INR')).toBe('₹')
      expect(getSymbolForCurrency('BDT')).toBe('৳')
    })

    it('should handle case insensitivity', () => {
      expect(getSymbolForCurrency('usd')).toBe('$')
      expect(getSymbolForCurrency('Bdt')).toBe('৳')
    })

    it('should fall back to dollar symbol for unknown currencies', () => {
      expect(getSymbolForCurrency('JPY')).toBe('$')
    })
  })

  describe('getCurrencyName', () => {
    it('should return correct names for known currencies', () => {
      expect(getCurrencyName('USD')).toBe('US Dollar')
      expect(getCurrencyName('BDT')).toBe('Bangladeshi Taka')
    })

    it('should return currency code itself for unknown currencies', () => {
      expect(getCurrencyName('CAD')).toBe('CAD')
    })
  })

  describe('getLocaleForCountry', () => {
    it('should return correct locale for known countries', () => {
      expect(getLocaleForCountry('US')).toBe('en-US')
      expect(getLocaleForCountry('BD')).toBe('bn-BD')
      expect(getLocaleForCountry('GB')).toBe('en-GB')
    })

    it('should fall back to en-US for unknown countries', () => {
      expect(getLocaleForCountry('XX')).toBe('en-US')
    })
  })
})
