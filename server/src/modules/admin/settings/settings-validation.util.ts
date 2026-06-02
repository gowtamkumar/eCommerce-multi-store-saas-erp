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
    currency: normalizeCurrencyCode(dto.currency),
    supportedCurrencies: normalizeSupportedCurrencies(dto.supportedCurrencies),
  }

  const effectiveCurrency = normalizeCurrencyCode(normalized.currency ?? existing?.currency)
  const effectiveSupportedCurrencies =
    normalized.supportedCurrencies ?? normalizeSupportedCurrencies(existing?.supportedCurrencies)

  if (effectiveCurrency && Array.isArray(effectiveSupportedCurrencies) && effectiveSupportedCurrencies.length > 0) {
    const matches = effectiveSupportedCurrencies.filter((currency) => currency.code === effectiveCurrency)
    if (matches.length === 0) {
      throw new BadRequestException('Base currency must be included in supportedCurrencies')
    }
    if (matches.length > 1) {
      throw new BadRequestException('supportedCurrencies cannot contain duplicate base currency entries')
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
