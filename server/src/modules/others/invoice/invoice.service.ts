import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InvoiceEntity } from './entities/invoice.entity';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { OrderEntity } from 'src/modules/order/entities/order.entity';

@Injectable()
export class InvoiceService {
    constructor(
        @InjectRepository(InvoiceEntity)
        private invoiceRepository: Repository<InvoiceEntity>,
        @InjectRepository(OrderEntity)
        private orderRepository: Repository<OrderEntity>,
    ) { }

    async create(createInvoiceDto: CreateInvoiceDto, tenantId: string) {
        const order = await this.orderRepository.findOne({
            where: { id: createInvoiceDto.orderId, tenantId },
        });

        if (!order) {
            throw new NotFoundException('Order not found');
        }

        const invoice = this.invoiceRepository.create({
            ...createInvoiceDto,
            tenantId,
        });

        return await this.invoiceRepository.save(invoice);
    }

    async findAll(tenantId: string) {
        return await this.invoiceRepository.find({
            where: { tenantId },
            relations: ['order', 'order.items', 'order.items.product'],
            order: { createdAt: 'DESC' },
        });
    }

    async findOne(id: string, tenantId: string) {
        const invoice = await this.invoiceRepository.findOne({
            where: { id, tenantId },
            relations: ['order', 'order.items', 'order.items.product'],
        });

        if (!invoice) {
            throw new NotFoundException('Invoice not found');
        }

        return invoice;
    }

    async update(id: string, updateInvoiceDto: UpdateInvoiceDto, tenantId: string) {
        const invoice = await this.findOne(id, tenantId);

        Object.assign(invoice, updateInvoiceDto);

        return await this.invoiceRepository.save(invoice);
    }

    async remove(id: string, tenantId: string) {
        const invoice = await this.findOne(id, tenantId);
        return await this.invoiceRepository.remove(invoice);
    }
}
