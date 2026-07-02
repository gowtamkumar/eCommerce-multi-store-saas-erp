import { Module, forwardRef } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { InvoiceEntity } from './entities/invoice.entity'
import { OrderModule } from '@/modules/admin/sales/order/order.module'
import { InvoiceController } from './invoice.controller'
import { InvoiceRepository } from './invoice.repository'
import { InvoiceService } from './invoice.service'
import { InvoiceProcessor } from './invoice.processor'
import { BullModule } from '@nestjs/bullmq'
import { StoreModule } from '@/modules/system/store/store.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([InvoiceEntity]),
    forwardRef(() => OrderModule),
    StoreModule,
    BullModule.registerQueue({
      name: 'invoice',
    }),
  ],
  controllers: [InvoiceController],
  providers: [InvoiceService, InvoiceRepository, InvoiceProcessor],
  exports: [InvoiceService, InvoiceRepository, BullModule],
})
export class InvoiceModule {}
