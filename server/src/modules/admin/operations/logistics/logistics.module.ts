import { Module } from '@nestjs/common'
import { CourierModule } from './courier/courier.module'
import { InventoryLedgerModule } from './inventory-transaction/inventory-transaction.module'
import { GrnModule } from './grn/grn.module'

@Module({
  imports: [CourierModule, InventoryLedgerModule, GrnModule],
  exports: [CourierModule, InventoryLedgerModule, GrnModule],
})
export class LogisticsModule {}
