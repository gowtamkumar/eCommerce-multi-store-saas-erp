import { Module } from '@nestjs/common'
import { InventoryTransactionModule } from '../../logistics/inventory-transaction/inventory-transaction.module'
import { PurchaseOrderController } from './purchase-order.controller'
import { PurchaseOrderRepository } from './purchase-order.repository'
import { PurchaseOrderService } from './purchase-order.service'
import { SupplierPaymentRepository } from './supplier-payment.repository'

@Module({
  imports: [InventoryTransactionModule],
  controllers: [PurchaseOrderController],
  providers: [PurchaseOrderService, PurchaseOrderRepository, SupplierPaymentRepository],
  exports: [PurchaseOrderService, PurchaseOrderRepository, SupplierPaymentRepository],
})
export class PurchaseModule {}
