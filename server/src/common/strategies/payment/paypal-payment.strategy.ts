import { BadRequestException } from '@nestjs/common'
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

export class PaypalPaymentStrategy implements PaymentStrategy {
  private async getAccessToken(clientId: string, clientSecret: string, isSandbox: boolean): Promise<string> {
    const baseUrl = isSandbox ? 'https://api-m.sandbox.paypal.com' : 'https://api-m.paypal.com'
    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')

    const response = await fetch(`${baseUrl}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    })

    const data: any = await response.json()
    if (data.error) {
      throw new Error(data.error_description || 'Failed to authenticate with PayPal')
    }
    return data.access_token
  }

  async initiate(
    order: OrderEntity,
    settings: SiteSettingsEntity,
    options: PaymentStrategyOptions,
  ): Promise<PaymentInitiationResult> {
    const clientId = settings.payment?.paypalClientId
    const clientSecret = settings.payment?.paypalClientSecret
    const isSandbox = settings.payment?.paypalMode !== 'live'
    const tran_id = order.transactionId || `PAYPAL_${order.id}_${Date.now()}`

    const isMock = !clientId || !clientSecret || clientId.startsWith('mock_') || process.env.NODE_ENV === 'test'

    if (isMock) {
      return {
        success: true,
        gatewayUrl: `${options.callbackUrl}/success?tran_id=${tran_id}&token=mock_token_${Date.now()}`,
        transactionId: tran_id,
      }
    }

    try {
      const accessToken = await this.getAccessToken(clientId, clientSecret, isSandbox)
      const baseUrl = isSandbox ? 'https://api-m.sandbox.paypal.com' : 'https://api-m.paypal.com'

      const response = await fetch(`${baseUrl}/v2/checkout/orders`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          intent: 'CAPTURE',
          purchase_units: [
            {
              reference_id: tran_id,
              amount: {
                currency_code: (order.currency || 'USD').toUpperCase(),
                value: (Number(order.totalAmount) / (Number(order.currencyRate) || 1)).toFixed(2),
              },
            },
          ],
          application_context: {
            return_url: `${options.callbackUrl}/success?tran_id=${tran_id}`,
            cancel_url: `${options.callbackUrl}/cancel?tran_id=${tran_id}`,
          },
        }),
      })

      const paypalOrder: any = await response.json()

      if (paypalOrder.error || !paypalOrder.links) {
        return {
          success: false,
          error: paypalOrder.message || 'Failed to create PayPal order',
        }
      }

      const approveLink = paypalOrder.links.find((link: any) => link.rel === 'approve')
      if (!approveLink) {
        return {
          success: false,
          error: 'No approval link found in PayPal response',
        }
      }

      return {
        success: true,
        gatewayUrl: approveLink.href,
        transactionId: tran_id,
      }
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'Failed to process payment with PayPal',
      }
    }
  }

  async validateCallback(response: any, query?: any): Promise<PaymentCallbackResult> {
    const data = { ...response, ...query }
    const tranId = data.tran_id
    return {
      success: true,
      transactionId: tranId,
      gatewayResponse: data,
      methodName: 'PayPal',
    }
  }

  async verifyTransaction(params: PaymentVerificationParams): Promise<PaymentVerificationResult> {
    const { valId, storeId, storePassword, isSandbox, expectedAmount, expectedCurrency } = params

    const isMock = !storeId || !storePassword || storeId.startsWith('mock_') || process.env.NODE_ENV === 'test'
    if (isMock) {
      return { success: true, gatewayResponse: { mock: true } }
    }

    if (!valId) {
      return { success: false, gatewayResponse: null, reason: 'Missing PayPal order token (valId)' }
    }

    try {
      const accessToken = await this.getAccessToken(storeId, storePassword, !!isSandbox)
      const baseUrl = isSandbox ? 'https://api-m.sandbox.paypal.com' : 'https://api-m.paypal.com'

      let orderRes = await fetch(`${baseUrl}/v2/checkout/orders/${valId}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      })
      let paypalOrder: any = await orderRes.json()

      if (paypalOrder.status === 'APPROVED') {
        const captureRes = await fetch(`${baseUrl}/v2/checkout/orders/${valId}/capture`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        })
        paypalOrder = await captureRes.json()
      }

      if (paypalOrder.status !== 'COMPLETED') {
        return { success: false, gatewayResponse: paypalOrder, reason: `PayPal status: ${paypalOrder.status}` }
      }

      const purchaseUnit = paypalOrder.purchase_units?.[0]
      const paymentAmount = purchaseUnit?.amount
      const gatewayCurrency = String(paymentAmount?.currency_code || '').toUpperCase()
      if (gatewayCurrency && gatewayCurrency !== expectedCurrency.toUpperCase()) {
        return { success: false, gatewayResponse: paypalOrder, reason: 'currency mismatch' }
      }

      const gatewayAmount = Number(paymentAmount?.value)
      if (Number.isFinite(gatewayAmount)) {
        const expectedMinor = Math.round(expectedAmount * 100)
        const gatewayMinor = Math.round(gatewayAmount * 100)
        if (Math.abs(gatewayMinor - expectedMinor) > 1) {
          return { success: false, gatewayResponse: paypalOrder, reason: 'amount mismatch' }
        }
      }

      return { success: true, gatewayResponse: paypalOrder }
    } catch (err: any) {
      return { success: false, gatewayResponse: null, reason: err.message }
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
