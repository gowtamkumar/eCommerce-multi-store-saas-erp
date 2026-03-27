import { PaymentMethod } from '@/common/enums/payment-method.enum'
import { PaymentStrategy } from './payment-strategy.interface'
import { SslCommerzPaymentStrategy } from './sslcommerz-payment.strategy'
import { CodPaymentStrategy } from './cod-payment.strategy'

export class PaymentStrategyFactory {
  static create(method: string | PaymentMethod): PaymentStrategy {
    switch (method) {
      case PaymentMethod.SSLCOMMERZ:
        return new SslCommerzPaymentStrategy()
      case PaymentMethod.COD:
        return new CodPaymentStrategy()
      default:
        // Default to COD or handle error
        return new CodPaymentStrategy()
    }
  }
}
