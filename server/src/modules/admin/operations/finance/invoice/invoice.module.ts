import { Module } from '@nestjs/common'
import { InvoiceController } from './invoice.controller'
import { InvoiceRepository } from './invoice.repository'
import { InvoiceService } from './invoice.service'
import { InvoiceProcessor } from './invoice.processor'
import { BullModule } from '@nestjs/bullmq'
import { TenantModule } from '@/modules/system/tenant/tenant.module'

@Module({
  imports: [
    TenantModule,
    BullModule.registerQueue({
      name: 'invoice',
    }),
  ],
  controllers: [InvoiceController],
  providers: [InvoiceService, InvoiceRepository, InvoiceProcessor],
  exports: [InvoiceService, InvoiceRepository, BullModule],
})
export class InvoiceModule {}
