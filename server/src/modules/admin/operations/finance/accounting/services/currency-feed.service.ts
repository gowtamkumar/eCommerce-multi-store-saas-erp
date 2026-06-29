import { Injectable, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import axios from 'axios'

@Injectable()
export class CurrencyFeedService {
  private readonly logger = new Logger(CurrencyFeedService.name)

  // Seeded fallback rates (relative to USD).
  // Updated daily via the live feed; never mutated on failure.
  private rates: Record<string, number> = {
    USD: 1.0,
    EUR: 0.92,
    GBP: 0.79,
    INR: 83.50,
    BDT: 117.50,
    AUD: 1.54,
    CAD: 1.37,
    SGD: 1.35,
    JPY: 157.20,
    CNY: 7.25,
    MYR: 4.72,
    AED: 3.67,
    SAR: 3.75,
    CHF: 0.90,
    HKD: 7.83,
    KRW: 1350.00,
    THB: 35.80,
    IDR: 16200.00,
    PKR: 278.00,
    LKR: 298.00,
    NPR: 133.50,
    MXN: 17.00,
    BRL: 5.10,
    ZAR: 18.50,
    NZD: 1.63,
    SEK: 10.30,
    NOK: 10.55,
    DKK: 6.88,
    PLN: 3.95,
    CZK: 22.80,
  }

  constructor() {
    this.updateRatesFeed().catch((err) => {
      this.logger.warn(`Initial exchange rate fetch failed: ${err.message}. Using local seed rates.`)
    })
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleDailyUpdate() {
    this.logger.log('Executing scheduled daily exchange rate update...')
    await this.updateRatesFeed()
  }

  async updateRatesFeed(): Promise<void> {
    try {
      this.logger.log('Fetching live exchange rates from public API...')
      const response = await axios.get('https://open.er-api.com/v6/latest/USD', { timeout: 5000 })
      if (response?.data?.rates) {
        const liveRates = response.data.rates as Record<string, number>
        // Update all tracked currencies
        for (const code of Object.keys(this.rates)) {
          if (liveRates[code] !== undefined) {
            this.rates[code] = Number(Number(liveRates[code]).toFixed(6))
          }
        }
        // Also absorb any additional currencies returned by the live feed
        for (const [code, rate] of Object.entries(liveRates)) {
          if (!(code in this.rates)) {
            this.rates[code] = Number(Number(rate).toFixed(6))
          }
        }
        this.logger.log(`Successfully updated ${Object.keys(this.rates).length} exchange rates from live feed.`)
      }
    } catch (err: any) {
      // On failure: do NOT mutate the rates. Keep last known good values.
      this.logger.warn(`Could not update live currency rates: ${err.message}. Retaining cached rates.`)
    }
  }

  async getExchangeRate(fromCurrency: string, toCurrency: string): Promise<number> {
    const from = fromCurrency.toUpperCase()
    const to = toCurrency.toUpperCase()

    if (from === to) return 1.0

    const fromRate = this.rates[from]
    const toRate = this.rates[to]

    if (!fromRate || !toRate) {
      this.logger.warn(`Unregistered exchange rate requested: ${from} -> ${to}. Falling back to 1.0`)
      return 1.0
    }

    // Cross rate: from -> USD -> to
    const rate = (1 / fromRate) * toRate
    return Number(rate.toFixed(6))
  }

  /**
   * Returns all currently tracked currencies and their rates relative to USD.
   */
  getSupportedCurrencies(): Record<string, number> {
    return { ...this.rates }
  }
}
