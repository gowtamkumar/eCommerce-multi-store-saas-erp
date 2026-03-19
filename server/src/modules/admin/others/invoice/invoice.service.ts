import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OrderEntity } from 'src/modules/admin/order/entities/order.entity';
import { Repository } from 'typeorm';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { InvoiceEntity } from './entities/invoice.entity';

@Injectable()
export class InvoiceService {
    private readonly logger = new Logger(InvoiceService.name);

    constructor(
        @InjectRepository(InvoiceEntity)
        private invoiceRepository: Repository<InvoiceEntity>,
        @InjectRepository(OrderEntity)
        private orderRepository: Repository<OrderEntity>,
    ) { }

    async createInvoice(createInvoiceDto: CreateInvoiceDto, tenantId: string) {
        this.logger.log(`${this.createInvoice.name} Service Called`);
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

    async findAllInvoices(tenantId: string) {
        this.logger.log(`${this.findAllInvoices.name} Service Called`);
        return await this.invoiceRepository.find({
            where: { tenantId },
            relations: ['order', 'order.items', 'order.items.product'],
            order: { createdAt: 'DESC' },
        });
    }

    async findOneInvoice(id: string, tenantId: string) {
        this.logger.log(`${this.findOneInvoice.name} Service Called`);
        const invoice = await this.invoiceRepository.findOne({
            where: { id, tenantId },
            relations: ['order', 'order.items', 'order.items.product'],
        });

        if (!invoice) {
            throw new NotFoundException('Invoice not found');
        }

        return invoice;
    }

    async updateInvoice(id: string, updateInvoiceDto: UpdateInvoiceDto, tenantId: string) {
        this.logger.log(`${this.updateInvoice.name} Service Called`);
        const invoice = await this.findOneInvoice(id, tenantId);

        Object.assign(invoice, updateInvoiceDto);

        return await this.invoiceRepository.save(invoice);
    }

    async removeInvoice(id: string, tenantId: string) {
        this.logger.log(`${this.removeInvoice.name} Service Called`);
        const invoice = await this.findOneInvoice(id, tenantId);
        return await this.invoiceRepository.remove(invoice);
    }
}
