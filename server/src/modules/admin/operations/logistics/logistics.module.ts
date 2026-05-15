import { Module } from '@nestjs/common'
import { CourierModule } from './courier/courier.module'
import { InventoryLedgerModule } from './inventory-transaction/inventory-transaction.module'

@Module({
  imports: [CourierModule, InventoryLedgerModule],
  exports: [CourierModule, InventoryLedgerModule],
})
export class LogisticsModule {}
