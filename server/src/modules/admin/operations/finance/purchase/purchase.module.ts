import { Module } from '@nestjs/common'
import { BullModule } from '@nestjs/bullmq'
import { InventoryTransactionModule } from '../../logistics/inventory-transaction/inventory-transaction.module'
import { PurchaseOrderController } from './controllers/purchase-order.controller'
import { PurchaseOrderService } from './services/purchase-order.service'

@Module({
  imports: [
    BullModule.registerQueue({ name: 'product' }),
    InventoryTransactionModule,
  ],
  controllers: [PurchaseOrderController],
  providers: [PurchaseOrderService],
  exports: [PurchaseOrderService],
})
export class PurchaseModule { }
