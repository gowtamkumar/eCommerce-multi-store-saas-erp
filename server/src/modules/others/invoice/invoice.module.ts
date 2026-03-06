import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InvoiceService } from './invoice.service';
import { InvoiceController } from './invoice.controller';
import { InvoiceEntity } from './entities/invoice.entity';
import { OrderEntity } from 'src/modules/order/entities/order.entity';

@Module({
    imports: [TypeOrmModule.forFeature([InvoiceEntity, OrderEntity])],
    controllers: [InvoiceController],
    providers: [InvoiceService],
    exports: [InvoiceService],
})
export class InvoiceModule { }
