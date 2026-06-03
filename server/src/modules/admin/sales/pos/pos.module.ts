import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { PosRegisterEntity } from './entities/pos-register.entity'
import { PosShiftEntity } from './entities/pos-shift.entity'
import { PosDrawerTransactionEntity } from './entities/pos-drawer-transaction.entity'
import { PosRegisterRepository } from './repositories/pos-register.repository'
import { PosShiftRepository } from './repositories/pos-shift.repository'
import { PosDrawerTransactionRepository } from './repositories/pos-drawer-transaction.repository'
import { PosService } from './pos.service'
import { PosController } from './pos.controller'
import { BullModule } from '@nestjs/bullmq'

@Module({
  imports: [
    TypeOrmModule.forFeature([PosRegisterEntity, PosShiftEntity, PosDrawerTransactionEntity]),
    BullModule.registerQueue({
      name: 'accounting',
    }),
  ],
  controllers: [PosController],
  providers: [
    PosService,
    PosRegisterRepository,
    PosShiftRepository,
    PosDrawerTransactionRepository,
  ],
  exports: [PosService, PosRegisterRepository, PosShiftRepository, PosDrawerTransactionRepository],
})
export class PosModule {}
