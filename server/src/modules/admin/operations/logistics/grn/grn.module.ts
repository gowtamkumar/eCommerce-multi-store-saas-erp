import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { GoodsReceivedNoteEntity } from './entities/grn.entity'
import { GrnItemEntity } from './entities/grn-item.entity'
import { GrnService } from './grn.service'
import { GrnController } from './grn.controller'
import { GrnRepository } from './grn.repository'
import { BullModule } from '@nestjs/bullmq'
import { SupplierModule } from '@/modules/admin/operations/finance/supplier/supplier.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([GoodsReceivedNoteEntity, GrnItemEntity]),
    BullModule.registerQueue({ name: 'product' }),
    SupplierModule,
  ],
  controllers: [GrnController],
  providers: [GrnService, GrnRepository],
  exports: [GrnService, GrnRepository],
})
export class GrnModule {}
