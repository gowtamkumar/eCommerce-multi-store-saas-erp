import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { FulfillmentTaskEntity } from './entities/fulfillment-task.entity'
import { FulfillmentItemEntity } from './entities/fulfillment-item.entity'
import { FulfillmentService } from './fulfillment.service'
import { FulfillmentController } from './fulfillment.controller'
import { FulfillmentRepository } from './fulfillment.repository'
import { FulfillmentProcessor } from './fulfillment.processor'
import { BullModule } from '@nestjs/bullmq'
import { InventoryLedgerModule } from '../inventory-transaction/inventory-transaction.module'
import { OrderEntity } from '@/modules/admin/sales/order/entities/order.entity'
import { NotificationModule } from '@/modules/admin/operations/infra/notification/notification.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([FulfillmentTaskEntity, FulfillmentItemEntity, OrderEntity]),
    InventoryLedgerModule,
    NotificationModule,
    BullModule.registerQueue({
      name: 'fulfillment',
    }),
  ],
  controllers: [FulfillmentController],
  providers: [FulfillmentService, FulfillmentRepository, FulfillmentProcessor],
  exports: [FulfillmentService, FulfillmentRepository, BullModule],
})
export class FulfillmentModule {}
