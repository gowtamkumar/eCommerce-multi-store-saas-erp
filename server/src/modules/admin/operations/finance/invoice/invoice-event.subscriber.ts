import { Injectable, OnModuleInit, Logger } from '@nestjs/common'
import { EventBusService } from '@/common/event-bus/event-bus.service'
import { InvoiceService } from './invoice.service'
import { InvoiceStatus } from '@/common/enums/invoice-status.enum'
import {
  ORDER_PAID_EVENT,
  ORDER_CANCELLED_EVENT,
  ORDER_PLACED_EVENT,
  OrderPaidEventPayload,
  OrderCancelledEventPayload,
  OrderPlacedEventPayload,
} from '@/common/event-bus/events/order.events'

@Injectable()
export class InvoiceEventSubscriber implements OnModuleInit {
  private readonly logger = new Logger(InvoiceEventSubscriber.name)

  constructor(
    private readonly eventBus: EventBusService,
    private readonly invoiceService: InvoiceService,
  ) {}

  onModuleInit() {
    this.logger.log('Registering Invoice Event Subscribers...')

    // 1. Listen to ORDER_PLACED_EVENT -> create invoice
    this.eventBus.ofEvent<OrderPlacedEventPayload>(ORDER_PLACED_EVENT).subscribe({
      next: async (event) => {
        const { orderId, paymentStatus } = event.payload
        this.logger.log(`Handling Order Placed Event to create invoice, order: ${orderId}`)
        try {
          await this.invoiceService.createInvoice(
            {
              orderId,
              issueDate: new Date(),
              status: paymentStatus === 'PAID' ? InvoiceStatus.PAID : InvoiceStatus.PENDING,
            } as any,
            event.ctx,
          )
          this.logger.log(`Successfully created invoice for order ${orderId}`)
        } catch (error: any) {
          this.logger.error(`Failed to create invoice for order ${orderId} via event: ${error.message}`)
        }
      },
    })

    // 2. Listen to ORDER_PAID_EVENT -> mark invoice as PAID
    this.eventBus.ofEvent<OrderPaidEventPayload>(ORDER_PAID_EVENT).subscribe({
      next: async (event) => {
        const { orderId } = event.payload
        this.logger.log(`Handling Order Paid Event for invoice update, order: ${orderId}`)
        try {
          await this.invoiceService.updateInvoiceStatusByOrderId(orderId, InvoiceStatus.PAID, event.ctx)
          this.logger.log(`Successfully updated invoice status to PAID for order ${orderId}`)
        } catch (error: any) {
          this.logger.error(`Failed to update invoice status for order ${orderId} via event: ${error.message}`)
        }
      },
    })

    // 3. Listen to ORDER_CANCELLED_EVENT -> mark invoice as CANCELLED
    this.eventBus.ofEvent<OrderCancelledEventPayload>(ORDER_CANCELLED_EVENT).subscribe({
      next: async (event) => {
        const { orderId } = event.payload
        this.logger.log(`Handling Order Cancelled Event for invoice update, order: ${orderId}`)
        try {
          await this.invoiceService.updateInvoiceStatusByOrderId(orderId, InvoiceStatus.CANCELLED, event.ctx)
          this.logger.log(`Successfully updated invoice status to CANCELLED for order ${orderId}`)
        } catch (error: any) {
          this.logger.error(`Failed to cancel invoice for order ${orderId} via event: ${error.message}`)
        }
      },
    })
  }
}
