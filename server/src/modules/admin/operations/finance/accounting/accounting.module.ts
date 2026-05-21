import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AccountEntity } from './entities/account.entity'
import { JournalEntryEntity } from './entities/journal-entry.entity'
import { LedgerEntryEntity } from './entities/ledger-entry.entity'
import { ArLedgerEntity } from './entities/ar-ledger.entity'
import { WalletLedgerEntity } from './entities/wallet-ledger.entity'
import { AccountingService } from './services/accounting.service'
import { AccountingIntegrationService } from './services/accounting-integration.service'
import { CogsService } from './services/cogs.service'
import { FinancialReportService } from './services/financial-report.service'
import { ArService } from './services/ar.service'
import { WalletService } from './services/wallet.service'

import { AccountingController } from './controllers/accounting.controller'
import { ArController } from './controllers/ar.controller'
import { WalletController } from './controllers/wallet.controller'

import { FiscalPeriodEntity } from './entities/fiscal-period.entity'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AccountEntity,
      JournalEntryEntity,
      LedgerEntryEntity,
      ArLedgerEntity,
      WalletLedgerEntity,
      FiscalPeriodEntity,
    ]),
  ],
  controllers: [AccountingController, ArController, WalletController],
  providers: [
    AccountingService,
    AccountingIntegrationService,
    CogsService,
    FinancialReportService,
    ArService,
    WalletService,
  ],
  exports: [
    AccountingService,
    AccountingIntegrationService,
    CogsService,
    FinancialReportService,
    ArService,
    WalletService,
  ],
})
export class AccountingModule {}
