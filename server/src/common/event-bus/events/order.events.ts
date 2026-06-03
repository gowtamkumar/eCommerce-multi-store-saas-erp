export const ORDER_CREDIT_PLACED_EVENT = 'order.credit_placed'
export const ORDER_PAID_EVENT = 'order.paid'
export const ORDER_CANCELLED_EVENT = 'order.cancelled'
export const ORDER_CONFIRMED_EVENT = 'order.confirmed'
export const ORDER_PLACED_EVENT = 'order.placed'

export interface OrderPlacedEventPayload {
  orderId: string
  paymentStatus: string
}

export interface OrderCreditPlacedEventPayload {
  orderId: string
  walletDeduction: number
  remainingAmount: number
  netRevenue: number
  taxAmount: number
}

export interface OrderPaidEventPayload {
  orderId: string
  paymentMethod: string
  walletDeduction: number
  remainingAmount: number
  netRevenue: number
  taxAmount: number
}

export interface OrderCancelledEventPayload {
  orderId: string
}

export interface OrderConfirmedEventPayload {
  orderId: string
}
