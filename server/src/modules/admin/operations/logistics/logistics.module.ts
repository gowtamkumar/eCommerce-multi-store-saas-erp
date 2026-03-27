import { Module } from '@nestjs/common'
import { InventoryTransactionModule } from './inventory-transaction/inventory-transaction.module'
import { CourierModule } from './courier/courier.module'

@Module({
  imports: [CourierModule, InventoryTransactionModule],
  exports: [CourierModule, InventoryTransactionModule],
})
export class LogisticsModule {}
