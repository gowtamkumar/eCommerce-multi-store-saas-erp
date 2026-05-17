import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { PosRegisterEntity } from './entities/pos-register.entity'
import { PosShiftEntity } from './entities/pos-shift.entity'
import { PosRegisterRepository } from './repositories/pos-register.repository'
import { PosShiftRepository } from './repositories/pos-shift.repository'
import { PosService } from './pos.service'
import { PosController } from './pos.controller'
import { InventoryLedgerModule } from '@/modules/admin/operations/logistics/inventory-transaction/inventory-transaction.module'
import { AccountingModule } from '@/modules/admin/operations/finance/accounting/accounting.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([PosRegisterEntity, PosShiftEntity]),
    InventoryLedgerModule,
    AccountingModule,
  ],
  controllers: [PosController],
  providers: [PosService, PosRegisterRepository, PosShiftRepository],
  exports: [PosService, PosRegisterRepository, PosShiftRepository],
})
export class PosModule {}
