import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { InvoiceService } from './invoice.service'
import { InvoiceController } from './invoice.controller'
import { InvoiceEntity } from './entities/invoice.entity'
import { OrderEntity } from '@/modules/admin/sales/order/entities/order.entity'
import { InvoiceRepository } from './invoice.repository'

@Module({
  imports: [TypeOrmModule.forFeature([InvoiceEntity, OrderEntity])],
  controllers: [InvoiceController],
  providers: [InvoiceService, InvoiceRepository],
  exports: [InvoiceService, InvoiceRepository],
})
export class InvoiceModule {}
