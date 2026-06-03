import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { FulfillmentTaskEntity } from './entities/fulfillment-task.entity'
import { FulfillmentItemEntity } from './entities/fulfillment-item.entity'
import { FulfillmentService } from './fulfillment.service'
import { FulfillmentController } from './fulfillment.controller'
import { FulfillmentRepository } from './fulfillment.repository'
import { FulfillmentEventSubscriber } from './fulfillment-event.subscriber'
import { InventoryLedgerModule } from '../inventory-transaction/inventory-transaction.module'
import { OrderEntity } from '@/modules/admin/sales/order/entities/order.entity'

@Module({
  imports: [
    TypeOrmModule.forFeature([FulfillmentTaskEntity, FulfillmentItemEntity, OrderEntity]),
    InventoryLedgerModule,
  ],
  controllers: [FulfillmentController],
  providers: [FulfillmentService, FulfillmentRepository, FulfillmentEventSubscriber],
  exports: [FulfillmentService, FulfillmentRepository],
})
export class FulfillmentModule { }
