import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { PurchaseOrderEntity } from './entities/purchase-order.entity';
import { PurchaseOrderItemEntity } from './entities/purchase-order-item.entity';
import { CreatePurchaseOrderDto, UpdatePurchaseOrderStatusDto } from './dto/purchase-order.dto';
import { PurchaseOrderStatus } from '../../../common/enums/purchase-order-status.enum';
import { InventoryTransactionService } from '../inventory-transaction/inventory-transaction.service';
import { InventoryTransactionType } from '../../../common/enums/inventory-transaction-type.enum';
import { InventoryTransactionReferenceType } from '../../../common/enums/inventory-transaction-reference-type.enum';

@Injectable()
export class PurchaseOrderService {
    constructor(
        @InjectRepository(PurchaseOrderEntity)
        private readonly repository: Repository<PurchaseOrderEntity>,
        @InjectRepository(PurchaseOrderItemEntity)
        private readonly itemRepository: Repository<PurchaseOrderItemEntity>,
        private readonly inventoryService: InventoryTransactionService,
        private readonly dataSource: DataSource,
    ) { }

    async create(dto: CreatePurchaseOrderDto, tenantId: string) {
        const totalAmount = dto.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);

        const purchaseOrder = this.repository.create({
            ...dto,
            totalAmount,
            tenantId,
            status: PurchaseOrderStatus.DRAFT,
        });

        return await this.repository.save(purchaseOrder);
    }

    async findAll(tenantId: string) {
        return await this.repository.find({
            where: { tenantId },
            relations: ['supplier'],
            order: { createdAt: 'DESC' },
        });
    }

    async findOne(id: string, tenantId: string) {
        const order = await this.repository.findOne({
            where: { id, tenantId },
            relations: ['supplier', 'items', 'items.product', 'items.variant'],
        });
        if (!order) {
            throw new NotFoundException('Purchase order not found');
        }
        return order;
    }

    async updateStatus(id: string, dto: UpdatePurchaseOrderStatusDto, tenantId: string) {
        const order = await this.findOne(id, tenantId);

        if (order.status === PurchaseOrderStatus.RECEIVED || order.status === PurchaseOrderStatus.CANCELLED) {
            throw new BadRequestException(`Cannot change status of a ${order.status} order`);
        }

        if (dto.status === PurchaseOrderStatus.RECEIVED) {
            return await this.receiveOrder(order, tenantId);
        }

        order.status = dto.status;
        return await this.repository.save(order);
    }

    private async receiveOrder(order: PurchaseOrderEntity, tenantId: string) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            order.status = PurchaseOrderStatus.RECEIVED;
            const savedOrder = await queryRunner.manager.save(order);

            for (const item of order.items) {
                await this.inventoryService.create({
                    productId: item.productId,
                    variantId: item.variantId,
                    quantity: item.quantity,
                    type: InventoryTransactionType.IN,
                    referenceType: InventoryTransactionReferenceType.PURCHASE,
                    referenceId: order.id,
                    supplierId: order.supplierId,
                }, tenantId);
            }

            await queryRunner.commitTransaction();
            return savedOrder;
        } catch (err) {
            await queryRunner.rollbackTransaction();
            throw err;
        } finally {
            await queryRunner.release();
        }
    }
}
