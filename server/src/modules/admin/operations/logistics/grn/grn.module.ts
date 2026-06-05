import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { GoodsReceivedNoteEntity } from './entities/grn.entity'
import { GrnItemEntity } from './entities/grn-item.entity'
import { GrnService } from './grn.service'
import { GrnController } from './grn.controller'
import { GrnRepository } from './grn.repository'
import { InventoryLedgerModule } from '@/modules/admin/operations/logistics/inventory-transaction/inventory-transaction.module'
import { NotificationModule } from '@/modules/admin/operations/infra/notification/notification.module'
import { SupplierAPLedgerEntity } from '@/modules/admin/operations/finance/supplier/entities/supplier-ap-ledger.entity'
import { SupplierAPLedgerRepository } from '@/modules/admin/operations/finance/supplier/supplier-ap-ledger.repository'

@Module({
  imports: [
    TypeOrmModule.forFeature([GoodsReceivedNoteEntity, GrnItemEntity, SupplierAPLedgerEntity]),
    InventoryLedgerModule,
    NotificationModule,
  ],
  controllers: [GrnController],
  providers: [GrnService, GrnRepository, SupplierAPLedgerRepository],
  exports: [GrnService, GrnRepository],
})
export class GrnModule {}
