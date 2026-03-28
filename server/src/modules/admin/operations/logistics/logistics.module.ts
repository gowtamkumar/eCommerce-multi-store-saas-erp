import { Module } from '@nestjs/common'
import { CourierModule } from './courier/courier.module'
import { InventoryTransactionModule } from './inventory-transaction/inventory-transaction.module'

@Module({
  imports: [CourierModule, InventoryTransactionModule],
  exports: [CourierModule, InventoryTransactionModule],
})
export class LogisticsModule {}
