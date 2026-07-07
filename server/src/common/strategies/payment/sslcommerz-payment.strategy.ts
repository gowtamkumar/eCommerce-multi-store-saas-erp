import { BadRequestException, InternalServerErrorException, Logger } from '@nestjs/common'
import { OrderEntity } from '@/modules/admin/sales/order/entities/order.entity'
import { SiteSettingsEntity } from '@/modules/admin/settings/entities/site-settings.entity'
import {
  PaymentInitiationResult,
  PaymentStrategy,
  PaymentStrategyOptions,
  PaymentCallbackResult,
  PaymentVerificationParams,
  PaymentVerificationResult,
} from './payment-strategy.interface'

const SSLCOMMERZ_VALID_STATUSES = new Set(['VALID', 'VALIDATED'])

export class SslCommerzPaymentStrategy implements PaymentStrategy {
  private readonly logger = new Logger(SslCommerzPaymentStrategy.name)

  async initiate(
    order: OrderEntity,
    settings: SiteSettingsEntity,
    options: PaymentStrategyOptions,
  ): Promise<PaymentInitiationResult> {
    const { callbackUrl, storeId, frontendUrl } = options

    const store_id = settings.payment?.sslCommerzStoreId
    const store_passwd = settings.payment?.sslCommerzStorePassword
    const is_live = !settings.payment?.sslCommerzIsSandbox
    const app_url = callbackUrl

    if (!store_id || !store_passwd) {
      this.logger.error(`SSLCommerz configuration missing for store: ${storeId}`)
      throw new BadRequestException('SSLCommerz gateway not configured properly')
    }

    const tran_id = order.transactionId || `TRAN_${order.id}_${Date.now()}`

    const initData: any = {
      store_id,
      store_passwd,
      total_amount: (order.totalAmount / (order.currencyRate || 1)).toFixed(2),
      currency: order.currency || 'BDT',
      tran_id,
      success_url: `${app_url}/success?tran_id=${tran_id}`,
      fail_url: `${app_url}/fail?tran_id=${tran_id}`,
      cancel_url: `${app_url}/cancel?tran_id=${tran_id}`,
      ipn_url: `${app_url}/api/v1/payment/ipn`,
      shipping_method: 'Courier',
      product_name:
        order.items
          ?.map((i) => i.product?.name)
          .join(', ')
          .substring(0, 250) || 'Order Items',
      product_category: 'General',
      product_profile: 'general',
      cus_name: order.customerName,
      cus_email: order.customerEmail,
      cus_add1: order.address,
      cus_add2: 'N/A',
      cus_city: 'N/A',
      cus_state: 'N/A',
      cus_postcode: 'N/A',
      cus_country: 'Bangladesh',
      cus_phone: order.customerPhone || '01700000000',
      cus_fax: order.customerPhone || '01700000000',
      ship_name: order.customerName,
      ship_add1: order.address,
      ship_add2: 'N/A',
      ship_city: 'N/A',
      ship_state: 'N/A',
      ship_postcode: 'N/A',
      ship_country: 'Bangladesh',
      value_a: frontendUrl || app_url,
      value_b: storeId,
    }

    const apiUrl = is_live
      ? 'https://securepay.sslcommerz.com/gwprocess/v4/api.php'
      : 'https://sandbox.sslcommerz.com/gwprocess/v4/api.php'

    const formData = new URLSearchParams()
    Object.entries(initData).forEach(([key, value]) => {
      formData.append(key, value as string)
    })

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        body: formData,
      })

      const result: any = await response.json()

      if (result.status === 'SUCCESS') {
        return {
          gatewayUrl: result.GatewayPageURL,
          success: true,
          transactionId: tran_id,
        }
      } else {
        return {
          success: false,
          error: result.failedreason || 'Failed to initiate payment',
        }
      }
    } catch (error) {
      this.logger.error('SSLCommerz init error:', error)
      throw new InternalServerErrorException('Failed to process payment with SSLCommerz')
    }
  }

  /**
   * SHAPE-ONLY check on the callback payload. This is intentionally narrow:
   * it does NOT confer trust — it only tells the caller "the payload looks
   * like an SSLCommerz success body". Authoritative trust comes from
   * {@link verifyTransaction} which hits the validator API server-to-server.
   */
  async validateCallback(response: any, query?: any): Promise<PaymentCallbackResult> {
    const status = String(response?.status ?? '').toUpperCase()
    const tranId = response?.tran_id ?? query?.tran_id

    return {
      success: SSLCOMMERZ_VALID_STATUSES.has(status),
      transactionId: tranId,
      gatewayResponse: response,
      methodName: response?.card_type || 'SSLCommerz',
    }
  }

  /**
   * Server-to-server validation against SSLCommerz' validator API. The caller
   * is responsible for supplying the merchant credentials we initiated with
   * (platform creds for subscriptions, store creds for order payments).
   * We additionally re-check tran_id, currency and amount against the values
   * we recorded at initiation — this is what makes the flow safe against a
   * forged `tran_id` arriving at our callback endpoints.
   */
  async verifyTransaction(params: PaymentVerificationParams): Promise<PaymentVerificationResult> {
    const {
      valId,
      transactionId,
      storeId,
      storePassword,
      isSandbox,
      expectedAmount,
      expectedCurrency,
      amountToleranceMinor = 1,
    } = params

    if (!valId) {
      return { success: false, gatewayResponse: null, reason: 'Missing val_id' }
    }
    if (!storeId || !storePassword) {
      this.logger.error('SSLCommerz verification skipped — credentials missing')
      return { success: false, gatewayResponse: null, reason: 'Gateway not configured' }
    }

    const baseUrl = isSandbox
      ? 'https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php'
      : 'https://securepay.sslcommerz.com/validator/api/validationserverAPI.php'

    const url = new URL(baseUrl)
    url.searchParams.set('val_id', valId)
    url.searchParams.set('store_id', storeId)
    url.searchParams.set('store_passwd', storePassword)
    url.searchParams.set('v', '1')
    url.searchParams.set('format', 'json')

    let payload: any
    try {
      const res = await fetch(url.toString(), { method: 'GET' })
      payload = await res.json()
    } catch (err) {
      this.logger.error('SSLCommerz validator API error', err as Error)
      return { success: false, gatewayResponse: null, reason: 'Validator API unreachable' }
    }

    const status = String(payload?.status ?? '').toUpperCase()
    if (!SSLCOMMERZ_VALID_STATUSES.has(status)) {
      this.logger.warn(
        `SSLCommerz validator rejected val_id=${valId} tran_id=${transactionId} status=${status}`,
      )
      return { success: false, gatewayResponse: payload, reason: `Gateway status: ${status}` }
    }

    // Defence-in-depth: confirm the validator's tran_id, amount, and currency
    // match what we recorded at initiation. This prevents a successful
    // small-amount transaction in one store being replayed against a larger
    // invoice in another store.
    const gatewayTranId = String(payload?.tran_id ?? '')
    if (gatewayTranId && gatewayTranId !== transactionId) {
      this.logger.warn(
        `SSLCommerz tran_id mismatch: expected=${transactionId} gateway=${gatewayTranId}`,
      )
      return { success: false, gatewayResponse: payload, reason: 'tran_id mismatch' }
    }

    const gatewayCurrency = String(payload?.currency ?? '').toUpperCase()
    const gatewayCurrencyType = String(payload?.currency_type ?? '').toUpperCase()

    const isCurrencyMatch =
      gatewayCurrency === expectedCurrency.toUpperCase() ||
      (gatewayCurrencyType && gatewayCurrencyType === expectedCurrency.toUpperCase())

    if (gatewayCurrency && !isCurrencyMatch) {
      this.logger.warn(
        `SSLCommerz currency mismatch: expected=${expectedCurrency} gateway=${gatewayCurrency}`,
      )
      return { success: false, gatewayResponse: payload, reason: 'currency mismatch' }
    }

    let gatewayAmount = Number(payload?.amount ?? payload?.currency_amount ?? NaN)
    // If currency was converted by the gateway, use the original currency_amount if it matches our expected currency.
    if (gatewayCurrencyType === expectedCurrency.toUpperCase() && payload?.currency_amount) {
      gatewayAmount = Number(payload.currency_amount)
    }

    if (Number.isFinite(gatewayAmount)) {
      const expectedMinor = Math.round(expectedAmount * 100)
      const gatewayMinor = Math.round(gatewayAmount * 100)
      if (Math.abs(gatewayMinor - expectedMinor) > amountToleranceMinor) {
        this.logger.warn(
          `SSLCommerz amount mismatch: expected=${expectedAmount} gateway=${gatewayAmount}`,
        )
        return { success: false, gatewayResponse: payload, reason: 'amount mismatch' }
      }
    }

    return { success: true, gatewayResponse: payload }
  }

  getRedirectUrl(response: any, appUrl: string): string {
    let baseUrl = appUrl
    if (response?.value_a) {
      try {
        const parsed = new URL(response.value_a)
        baseUrl = parsed.origin
      } catch {
        baseUrl = String(response.value_a).replace(/\/api\/payment.*$/, '')
      }
    }
    const tran_id = response?.tran_id || response?.tran_Id
    let status = 'success'
    const resStatus = String(response?.status || '').toUpperCase()
    if (resStatus === 'FAILED') status = 'fail'
    if (resStatus === 'CANCELLED') status = 'cancel'

    return `${baseUrl}/payment/${status}?tran_id=${tran_id}`
  }
}
