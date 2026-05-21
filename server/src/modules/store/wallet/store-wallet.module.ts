import { Module } from '@nestjs/common'
import { AccountingModule } from '@/modules/admin/operations/finance/accounting/accounting.module'
import { StoreWalletController } from './store-wallet.controller'

@Module({
  imports: [AccountingModule], // AccountingModule exports WalletService
  controllers: [StoreWalletController],
})
export class StoreWalletModule {}
