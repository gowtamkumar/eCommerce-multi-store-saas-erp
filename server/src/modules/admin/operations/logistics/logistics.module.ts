import { Module } from '@nestjs/common'
import { CourierModule } from './courier/courier.module'
import { InventoryLedgerModule } from './inventory-transaction/inventory-transaction.module'
import { GrnModule } from './grn/grn.module'
import { FulfillmentModule } from './fulfillment/fulfillment.module'

@Module({
  imports: [CourierModule, InventoryLedgerModule, GrnModule, FulfillmentModule],
  exports: [CourierModule, InventoryLedgerModule, GrnModule, FulfillmentModule],
})
export class LogisticsModule {}
