import { Injectable, OnModuleInit, Logger } from '@nestjs/common'
import { EventBusService } from '@/common/event-bus/event-bus.service'
import { FulfillmentService } from './fulfillment.service'
import {
  ORDER_CONFIRMED_EVENT,
  OrderConfirmedEventPayload,
} from '@/common/event-bus/events/order.events'

@Injectable()
export class FulfillmentEventSubscriber implements OnModuleInit {
  private readonly logger = new Logger(FulfillmentEventSubscriber.name)

  constructor(
    private readonly eventBus: EventBusService,
    private readonly fulfillmentService: FulfillmentService,
  ) {}

  onModuleInit() {
    this.logger.log('Registering Fulfillment Event Subscribers...')

    // Listen to ORDER_CONFIRMED_EVENT -> create picking/packing task
    this.eventBus.ofEvent<OrderConfirmedEventPayload>(ORDER_CONFIRMED_EVENT).subscribe({
      next: async (event) => {
        const { orderId } = event.payload
        this.logger.log(`Handling Order Confirmed Event for fulfillment, order: ${orderId}`)
        try {
          await this.fulfillmentService.createFromOrder(orderId, event.ctx)
          this.logger.log(`Successfully created fulfillment task for order ${orderId}`)
        } catch (error: any) {
          this.logger.error(`Failed to trigger fulfillment for order ${orderId} via event: ${error.message}`)
        }
      },
    })
  }
}
