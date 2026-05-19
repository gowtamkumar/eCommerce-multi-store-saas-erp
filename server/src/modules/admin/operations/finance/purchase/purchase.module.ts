import { BullModule } from '@nestjs/bullmq'
import { Module, forwardRef } from '@nestjs/common'
import { InventoryLedgerModule } from '../../logistics/inventory-transaction/inventory-transaction.module'
import { PurchaseOrderController } from './controllers/purchase-order.controller'
import { PurchaseOrderService } from './services/purchase-order.service'

import { TenantModule } from '@/modules/system/tenant/tenant.module'
import { GrnModule } from '@/modules/admin/operations/logistics/grn/grn.module'

import { NotificationModule } from '@/modules/admin/operations/infra/notification/notification.module'

@Module({
  imports: [
    BullModule.registerQueue({ name: 'product' }),
    InventoryLedgerModule,
    TenantModule,
    forwardRef(() => GrnModule),
    NotificationModule,
  ],
  controllers: [PurchaseOrderController],
  providers: [PurchaseOrderService],
  exports: [PurchaseOrderService],
})
export class PurchaseModule {}
