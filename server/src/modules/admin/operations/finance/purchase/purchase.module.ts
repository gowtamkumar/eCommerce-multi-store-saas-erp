import { BullModule } from '@nestjs/bullmq'
import { Module } from '@nestjs/common'
import { InventoryTransactionModule } from '../../logistics/inventory-transaction/inventory-transaction.module'
import { PurchaseOrderController } from './controllers/purchase-order.controller'
import { PurchaseOrderService } from './services/purchase-order.service'

import { TenantModule } from '@/modules/system/tenant/tenant.module'

@Module({
  imports: [
    BullModule.registerQueue({ name: 'product' }),
    InventoryTransactionModule,
    TenantModule,
  ],
  controllers: [PurchaseOrderController],
  providers: [PurchaseOrderService],
  exports: [PurchaseOrderService],
})
export class PurchaseModule {}
