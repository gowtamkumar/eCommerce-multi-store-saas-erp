import { BadRequestException, InternalServerErrorException, Logger } from '@nestjs/common'
import { OrderEntity } from '@/modules/admin/sales/order/entities/order.entity'
import { SiteSettingsEntity } from '@/modules/admin/settings/entities/site-settings.entity'
import {
  PaymentInitiationResult,
  PaymentStrategy,
  PaymentStrategyOptions,
  PaymentCallbackResult,
} from './payment-strategy.interface'

export class SslCommerzPaymentStrategy implements PaymentStrategy {
  private readonly logger = new Logger(SslCommerzPaymentStrategy.name)

  async initiate(
    order: OrderEntity,
    settings: SiteSettingsEntity,
    options: PaymentStrategyOptions,
  ): Promise<PaymentInitiationResult> {
    const { callbackUrl, tenantId } = options

    const store_id = settings.payment?.sslCommerzStoreId
    const store_passwd = settings.payment?.sslCommerzStorePassword
    const is_live = !settings.payment?.sslCommerzIsSandbox
    const app_url = callbackUrl

    if (!store_id || !store_passwd) {
      throw new BadRequestException('SSLCommerz gateway not configured')
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
      value_a: app_url,
      value_b: tenantId,
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

  async validateCallback(response: any, query?: any): Promise<PaymentCallbackResult> {
    return {
      success:
        response.status === 'VALID' || response.status === 'AUTHENTICATED' || !!query?.tran_id,
      transactionId: response.tran_id || query?.tran_id,
      gatewayResponse: response,
      methodName: response.card_type || 'SSLCommerz',
    }
  }

  getRedirectUrl(response: any, appUrl: string): string {
    const baseUrl = response.value_a?.replace('/api/payment', '') || appUrl
    const tran_id = response.tran_id
    let status = 'success'
    if (response.status === 'FAILED') status = 'fail'
    if (response.status === 'CANCELLED') status = 'cancel'

    return `${baseUrl}/payment/${status}?tran_id=${tran_id}`
  }
}
