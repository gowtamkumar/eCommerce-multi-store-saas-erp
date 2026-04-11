import { Module } from '@nestjs/common'
import { BullModule } from '@nestjs/bullmq'
import { InventoryTransactionModule } from '../../logistics/inventory-transaction/inventory-transaction.module'
import { PurchaseOrderController } from './purchase-order.controller'
import { PurchaseOrderService } from './purchase-order.service'

@Module({
  imports: [
    InventoryTransactionModule,
    BullModule.registerQueue({ name: 'product' }),
  ],
  controllers: [PurchaseOrderController],
  providers: [PurchaseOrderService],
  exports: [PurchaseOrderService],
})
export class PurchaseModule { }
