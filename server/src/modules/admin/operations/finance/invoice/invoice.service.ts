import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { InvoiceStatus } from '@/common/enums/invoice-status.enum';
import { OrderEntity } from '@/modules/admin/sales/order/entities/order.entity';
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

    async createInvoice(createInvoiceDto: CreateInvoiceDto, tenantId: string, manager?: EntityManager) {
        this.logger.log(`${this.createInvoice.name} Service Called`);
        const orderRepo = manager ? manager.getRepository(OrderEntity) : this.orderRepository;
        const invoiceRepo = manager ? manager.getRepository(InvoiceEntity) : this.invoiceRepository;

        const order = await orderRepo.findOne({
            where: { id: createInvoiceDto.orderId, tenantId },
        });

        if (!order) {
            throw new NotFoundException('Order not found');
        }

        // Generate invoice number if not provided
        let invoiceNumber = createInvoiceDto.invoiceNumber;
        if (!invoiceNumber) {
            const date = new Date();
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const random = Math.floor(1000 + Math.random() * 9000);
            invoiceNumber = `INV-${year}${month}-${random}`;
            
            // Basic check for uniqueness (could be better with a dedicated counter)
            const exists = await invoiceRepo.findOne({ where: { invoiceNumber, tenantId } });
            if (exists) {
                invoiceNumber = `INV-${year}${month}-${random + 1}`;
            }
        }

        const invoice = invoiceRepo.create({
            ...createInvoiceDto,
            invoiceNumber,
            tenantId,
            issueDate: createInvoiceDto.issueDate || new Date(),
            status: createInvoiceDto.status || InvoiceStatus.PENDING,
            userId: order.userId,
        });

        return await invoiceRepo.save(invoice);
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

    async updateInvoiceStatusByOrderId(orderId: string, status: InvoiceStatus, tenantId: string, manager?: EntityManager) {
        this.logger.log(`${this.updateInvoiceStatusByOrderId.name} Service Called`);
        const invoiceRepo = manager ? manager.getRepository(InvoiceEntity) : this.invoiceRepository;
        const invoice = await invoiceRepo.findOne({ where: { orderId, tenantId } });
        if (invoice) {
            invoice.status = status;
            await invoiceRepo.save(invoice);
        }
    }
}
