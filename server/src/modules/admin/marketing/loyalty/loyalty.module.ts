import { Module, forwardRef } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { LoyaltyLedgerEntity } from './entities/loyalty-ledger.entity'
import { LoyaltyConfigEntity } from './entities/loyalty-config.entity'
import { UserEntity } from '@/modules/admin/core/user/entities/user.entity'
import { OrderEntity } from '@/modules/admin/sales/order/entities/order.entity'
import { LoyaltyService } from './services/loyalty.service'
import { ReferralService } from './services/referral.service'
import { LoyaltyController } from './controllers/loyalty.controller'
import { AccountingModule } from '@/modules/admin/operations/finance/accounting/accounting.module'
import { BullModule } from '@nestjs/bullmq'
import { TierSchedulerProcessor } from './queue/tier-scheduler.processor'
import { LoyaltySchedulerService } from './services/loyalty-scheduler.service'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      LoyaltyLedgerEntity,
      LoyaltyConfigEntity,
      UserEntity,
      OrderEntity,
    ]),
    AccountingModule, // Provides WalletService
    BullModule.registerQueue({
      name: 'loyalty',
    }),
  ],
  providers: [LoyaltyService, ReferralService, TierSchedulerProcessor, LoyaltySchedulerService],
  controllers: [LoyaltyController],
  exports: [LoyaltyService, ReferralService, BullModule],
})
export class LoyaltyModule {}
