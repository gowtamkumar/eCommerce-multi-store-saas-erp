import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { GoodsReceivedNoteEntity } from './entities/grn.entity'
import { GrnItemEntity } from './entities/grn-item.entity'
import { GrnService } from './grn.service'
import { GrnController } from './grn.controller'
import { GrnRepository } from './grn.repository'
import { InventoryLedgerModule } from '@/modules/admin/operations/logistics/inventory-transaction/inventory-transaction.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([GoodsReceivedNoteEntity, GrnItemEntity]),
    InventoryLedgerModule,
  ],
  controllers: [GrnController],
  providers: [GrnService, GrnRepository],
  exports: [GrnService, GrnRepository],
})
export class GrnModule {}
