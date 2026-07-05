type SupportedCurrency = {
    code: string;
    symbol: string;
    rate: number;
};

export interface CurrencyConversionSettings {
    currency?: string;
    supportedCurrencies?: SupportedCurrency[];
}

/** Convert an amount from a source currency into the store base currency. */
export function convertAmountToBaseCurrency(
    amount: number | string,
    fromCurrencyCode: string | undefined,
    settings: CurrencyConversionSettings | null | undefined,
): number {
    const num = Number(amount) || 0;
    const baseCode = settings?.currency;
    if (!baseCode) return num;

    const fromCode = (fromCurrencyCode || baseCode).toUpperCase();
    if (fromCode === baseCode.toUpperCase()) return num;

    const fromCurrency = settings.supportedCurrencies?.find(
        (c) => c.code.toUpperCase() === fromCode,
    );
    if (!fromCurrency?.rate) return num;

    // Rate is defined as: 1 unit of this currency = rate base-units (see SettingsContext).
    return num * fromCurrency.rate;
}
