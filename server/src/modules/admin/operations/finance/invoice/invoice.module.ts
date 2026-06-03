import { Module } from '@nestjs/common'
import { InvoiceController } from './invoice.controller'
import { InvoiceRepository } from './invoice.repository'
import { InvoiceService } from './invoice.service'
import { InvoiceEventSubscriber } from './invoice-event.subscriber'

import { TenantModule } from '@/modules/system/tenant/tenant.module'

@Module({
  imports: [TenantModule],
  controllers: [InvoiceController],
  providers: [InvoiceService, InvoiceRepository, InvoiceEventSubscriber],
  exports: [InvoiceService, InvoiceRepository],
})
export class InvoiceModule {}
