export type AiAutomationEventType = 'product.created' | 'cart.abandoned'

export interface ProductCreatedEvent {
  storeId: string
  productId: string
  productName: string
  category?: string
  hasSeoFields: boolean
}

export interface CartAbandonedEvent {
  storeId: string
  cartId: string
  customerName: string
  customerEmail?: string
  customerPhone?: string
  cartSummary: string
  messageTemplate?: string
  hoursSinceUpdate?: number
}

export interface AiAutomationDispatchPayload {
  eventType: AiAutomationEventType
  productId?: string
  productName?: string
  category?: string
  hasSeoFields?: boolean
  cartId?: string
  customerName?: string
  customerEmail?: string
  customerPhone?: string
  cartSummary?: string
  messageTemplate?: string
  hoursSinceUpdate?: number
}
