import { BadRequestException } from '@nestjs/common'
import { CurrenciesDto } from './dto/currencies.dto'
import { UpdateSiteSettingsDto } from './dto/settings.dto'
import { SiteSettingsEntity } from './entities/site-settings.entity'

function normalizeCurrencyCode(value?: string): string | undefined {
  return typeof value === 'string' ? value.trim().toUpperCase() : value
}

function normalizeSupportedCurrencies(currencies?: CurrenciesDto[]): CurrenciesDto[] | undefined {
  if (!Array.isArray(currencies)) return currencies
  return currencies.map((currency) => ({
    ...currency,
    code: normalizeCurrencyCode(currency.code),
    symbol: typeof currency.symbol === 'string' ? currency.symbol.trim() : currency.symbol,
    name: typeof currency.name === 'string' ? currency.name.trim() : currency.name,
  }))
}

/**
 * Enforce cross-field invariants that DTO decorators cannot express:
 * if a base currency is configured and supportedCurrencies is non-empty, the
 * base currency must be present exactly once. This keeps storefront currency
 * switching from silently losing the selected base currency.
 */
export function normalizeAndValidateSettingsUpdate(
  dto: UpdateSiteSettingsDto,
  existing?: Pick<SiteSettingsEntity, 'currency' | 'supportedCurrencies'> | null,
): UpdateSiteSettingsDto {
  const normalized: UpdateSiteSettingsDto = {
    ...dto,
    currency:
      typeof dto.currency === 'string' && dto.currency.trim() !== ''
        ? normalizeCurrencyCode(dto.currency)
        : undefined,
    supportedCurrencies: normalizeSupportedCurrencies(dto.supportedCurrencies),
    defaultBranchId:
      dto.defaultBranchId === undefined
        ? undefined
        : typeof dto.defaultBranchId === 'string' && dto.defaultBranchId.trim() !== ''
          ? dto.defaultBranchId
          : null,
  }

  const effectiveCurrency = normalizeCurrencyCode(normalized.currency ?? existing?.currency)
  let effectiveSupportedCurrencies =
    normalized.supportedCurrencies ?? normalizeSupportedCurrencies(existing?.supportedCurrencies)

  if (
    effectiveCurrency &&
    Array.isArray(effectiveSupportedCurrencies) &&
    effectiveSupportedCurrencies.length > 0
  ) {
    const matches = effectiveSupportedCurrencies.filter(
      (currency) => currency.code === effectiveCurrency,
    )
    if (matches.length === 0) {
      const defaultSymbolMap: Record<string, string> = {
        BDT: '৳',
        USD: '$',
        EUR: '€',
        GBP: '£',
        INR: '₹',
        CAD: '$',
        AUD: '$',
        JPY: '¥',
        CNY: '¥',
      }
      const defaultNameMap: Record<string, string> = {
        BDT: 'Bangladeshi Taka',
        USD: 'US Dollar',
        EUR: 'Euro',
        GBP: 'British Pound',
        INR: 'Indian Rupee',
        CAD: 'Canadian Dollar',
        AUD: 'Australian Dollar',
        JPY: 'Japanese Yen',
        CNY: 'Chinese Yuan',
      }
      const baseEntry: CurrenciesDto = {
        code: effectiveCurrency,
        symbol: defaultSymbolMap[effectiveCurrency] || '$',
        rate: 1,
        name: defaultNameMap[effectiveCurrency] || `${effectiveCurrency} (Base)`,
      }
      if (!normalized.supportedCurrencies) {
        normalized.supportedCurrencies =
          normalizeSupportedCurrencies(existing?.supportedCurrencies) || []
      }
      normalized.supportedCurrencies.push(baseEntry)
      effectiveSupportedCurrencies = normalized.supportedCurrencies
    } else if (matches.length > 1) {
      throw new BadRequestException(
        'supportedCurrencies cannot contain duplicate base currency entries',
      )
    }
  }

  if (Array.isArray(normalized.supportedCurrencies)) {
    const seen = new Set<string>()
    for (const currency of normalized.supportedCurrencies) {
      if (!currency.code) continue
      if (seen.has(currency.code)) {
        throw new BadRequestException(`Duplicate supported currency code: ${currency.code}`)
      }
      seen.add(currency.code)
    }
  }

  return normalized
}
