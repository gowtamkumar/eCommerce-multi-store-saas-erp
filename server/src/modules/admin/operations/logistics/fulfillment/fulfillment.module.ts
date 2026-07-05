import { Module, forwardRef } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { FulfillmentTaskEntity } from './entities/fulfillment-task.entity'
import { FulfillmentItemEntity } from './entities/fulfillment-item.entity'
import { FulfillmentService } from './fulfillment.service'
import { FulfillmentController } from './fulfillment.controller'
import { FulfillmentRepository } from './fulfillment.repository'
import { FulfillmentProcessor } from './fulfillment.processor'
import { BullModule } from '@nestjs/bullmq'
import { InventoryLedgerModule } from '../inventory-transaction/inventory-transaction.module'
import { NotificationModule } from '@/modules/admin/operations/infra/notification/notification.module'
import { OrderModule } from '@/modules/admin/sales/order/order.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([FulfillmentTaskEntity, FulfillmentItemEntity]),
    InventoryLedgerModule,
    NotificationModule,
    forwardRef(() => OrderModule),
    BullModule.registerQueue({
      name: 'fulfillment',
    }),
  ],
  controllers: [FulfillmentController],
  providers: [FulfillmentService, FulfillmentRepository, FulfillmentProcessor],
  exports: [FulfillmentService, FulfillmentRepository, BullModule],
})
export class FulfillmentModule {}
