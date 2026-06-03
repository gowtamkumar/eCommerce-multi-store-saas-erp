import { Module, Global } from '@nestjs/common'
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
import { AccountingOutboxService } from './services/accounting-outbox.service'
import { AccountingOutboxEntity } from './entities/accounting-outbox.entity'

import { AccountingController } from './controllers/accounting.controller'
import { ArController } from './controllers/ar.controller'
import { WalletController } from './controllers/wallet.controller'

import { FiscalPeriodEntity } from './entities/fiscal-period.entity'
import { DunningRuleEntity } from './entities/dunning-rule.entity'
import { DunningLogEntity } from './entities/dunning-log.entity'
import { DunningService } from './services/dunning.service'
import { MailModule } from '@/modules/admin/operations/infra/mail/mail.module'
import { NotificationModule } from '@/modules/admin/operations/infra/notification/notification.module'
import { TaxRuleEntity } from './entities/tax-rule.entity'
import { TaxService } from './services/tax.service'
import { TaxController } from './controllers/tax.controller'
import { BullModule } from '@nestjs/bullmq'
import { AccountingSchedulerService } from './accounting-scheduler.service'
import { AccountingProcessor } from './accounting.processor'

@Global()
@Module({
  imports: [
    MailModule,
    NotificationModule,
    TypeOrmModule.forFeature([
      AccountEntity,
      JournalEntryEntity,
      LedgerEntryEntity,
      ArLedgerEntity,
      WalletLedgerEntity,
      FiscalPeriodEntity,
      AccountingOutboxEntity,
      DunningRuleEntity,
      DunningLogEntity,
      TaxRuleEntity,
    ]),
    BullModule.registerQueue({
      name: 'accounting',
    }),
  ],
  controllers: [AccountingController, ArController, WalletController, TaxController],
  providers: [
    AccountingService,
    AccountingIntegrationService,
    CogsService,
    FinancialReportService,
    ArService,
    WalletService,
    AccountingOutboxService,
    DunningService,
    TaxService,
    AccountingSchedulerService,
    AccountingProcessor,
  ],
  exports: [
    AccountingService,
    AccountingIntegrationService,
    CogsService,
    FinancialReportService,
    ArService,
    WalletService,
    AccountingOutboxService,
    DunningService,
    TaxService,
  ],
})
export class AccountingModule {}
