import { PaymentMethod } from '@/common/enums/payment-method.enum'
import { PaymentStrategy } from './payment-strategy.interface'
import { SslCommerzPaymentStrategy } from './sslcommerz-payment.strategy'
import { CodPaymentStrategy } from './cod-payment.strategy'
import { StripePaymentStrategy } from './stripe-payment.strategy'
import { PaypalPaymentStrategy } from './paypal-payment.strategy'

export class PaymentStrategyFactory {
  static create(method: string | PaymentMethod): PaymentStrategy {
    switch (method) {
      case PaymentMethod.SSLCOMMERZ:
        return new SslCommerzPaymentStrategy()
      case PaymentMethod.COD:
        return new CodPaymentStrategy()
      case PaymentMethod.STRIPE:
        return new StripePaymentStrategy()
      case PaymentMethod.PAYPAL:
        return new PaypalPaymentStrategy()
      default:
        // Default to COD or handle error
        return new CodPaymentStrategy()
    }
  }
}
