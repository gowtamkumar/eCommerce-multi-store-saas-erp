export function getSymbolForCurrency(currency: string): string {
  const symbols: Record<string, string> = {
    USD: '$',
    GBP: '£',
    EUR: '€',
    INR: '₹',
    BDT: '৳',
  }
  return symbols[currency.toUpperCase()] || '$'
}

export function getCurrencyName(currency: string): string {
  const names: Record<string, string> = {
    USD: 'US Dollar',
    GBP: 'British Pound',
    EUR: 'Euro',
    INR: 'Indian Rupee',
    BDT: 'Bangladeshi Taka',
  }
  return names[currency.toUpperCase()] || currency
}

export function getLocaleForCountry(country: string): string {
  const locales: Record<string, string> = {
    US: 'en-US',
    GB: 'en-GB',
    DE: 'de-DE',
    FR: 'fr-FR',
    IN: 'en-IN',
    BD: 'bn-BD',
  }
  return locales[country.toUpperCase()] || 'en-US'
}
