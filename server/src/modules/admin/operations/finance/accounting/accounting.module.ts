import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AccountEntity } from './entities/account.entity'
import { JournalEntryEntity } from './entities/journal-entry.entity'
import { LedgerEntryEntity } from './entities/ledger-entry.entity'
import { AccountingService } from './services/accounting.service'
import { AccountingIntegrationService } from './services/accounting-integration.service'
import { CogsService } from './services/cogs.service'
import { FinancialReportService } from './services/financial-report.service'

import { AccountingController } from './controllers/accounting.controller'

@Module({
  imports: [TypeOrmModule.forFeature([AccountEntity, JournalEntryEntity, LedgerEntryEntity])],
  controllers: [AccountingController],
  providers: [AccountingService, AccountingIntegrationService, CogsService, FinancialReportService],
  exports: [AccountingService, AccountingIntegrationService, CogsService, FinancialReportService],
})
export class AccountingModule {}
