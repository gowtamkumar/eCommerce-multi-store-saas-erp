import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReturnStatus } from '@/common/enums/return-status.enum';
import { ProductEntity } from '@/modules/admin/catalog/product/entities/product.entity';
import { ProductVariantEntity } from '@/modules/admin/catalog/product/entities/variant.entity';
import { CreateReturnDto } from '@/modules/admin/sales/order/dto/create-return.dto';
import { OrderReturnEntity } from '@/modules/admin/sales/order/entities/order-return.entity';
import { OrderEntity } from '@/modules/admin/sales/order/entities/order.entity';

@Injectable()
export class ReturnService {
    private readonly logger = new Logger(ReturnService.name);

    constructor(
        @InjectRepository(OrderReturnEntity)
        private returnRepository: Repository<OrderReturnEntity>,
        @InjectRepository(OrderEntity)
        private orderRepository: Repository<OrderEntity>,
        @InjectRepository(ProductEntity)
        private productRepository: Repository<ProductEntity>,
        @InjectRepository(ProductVariantEntity)
        private variantRepository: Repository<ProductVariantEntity>,
    ) { }

    async createReturnRequest(userId: string, tenantId: string, dto: CreateReturnDto) {
        this.logger.log(`${this.createReturnRequest.name} Service Called`);
        const { orderId, items, reason } = dto;

        const order = await this.orderRepository.findOne({
            where: { id: orderId, userId, tenantId },
            relations: ['items'],
        });

        if (!order) {
            throw new NotFoundException('Order not found or does not belong to user');
        }

        // Basic validation: Check if items are in the order
        // In a real app, strict quantity checks against previously returned items would be needed
        console.log('=== RETURN DEBUG ===');
        console.log('Order items:', order.items.map(i => ({ productId: i.productId, variantId: i.variantId })));
        console.log('Return items:', items);

        for (const returnItem of items) {
            const orderItem = order.items.find(
                (oi) =>
                    oi.productId === returnItem.productId &&
                    (oi.variantId === returnItem.variantId ||
                        (!oi.variantId && !returnItem.variantId))
            );

            console.log("returnItem", orderItem);


            if (!orderItem) {
                throw new BadRequestException('Item not found in order');
            }
            if (returnItem.quantity > orderItem.quantity) {
                throw new BadRequestException('Return quantity exceeds ordered quantity');
            }
        }

        const returnRequest = this.returnRepository.create({
            orderId,
            userId,
            tenantId,
            reason,
            items,
            status: ReturnStatus.PENDING,
        });

        return await this.returnRepository.save(returnRequest);
    }

    async findAllReturns(tenantId: string) {
        this.logger.log(`${this.findAllReturns.name} Service Called`);
        console.log('Fetching returns for tenant:', tenantId);
        const returns = await this.returnRepository.find({
            where: { tenantId },
            order: { createdAt: 'DESC' },
            relations: ['order', 'order.items', 'order.items.product', 'order.items.variant'],
        });

        console.log('Found returns:', returns.length);
        return returns;
    }

    async findByUser(userId: string, tenantId: string) {
        this.logger.log(`${this.findByUser.name} Service Called`);
        return await this.returnRepository.find({
            where: { userId, tenantId },
            order: { createdAt: 'DESC' },
            relations: ['order'],
        });
    }

    async findOneReturn(id: string, tenantId: string) {
        this.logger.log(`${this.findOneReturn.name} Service Called`);
        const returnRequest = await this.returnRepository.findOne({
            where: { id, tenantId },
            relations: ['order', 'order.items', 'order.items.product', 'order.items.variant', 'user'],
        });

        if (!returnRequest) {
            throw new NotFoundException('Return request not found');
        }

        return returnRequest;
    }

    async updateReturnRequestStatus(
        id: string,
        tenantId: string,
        status: ReturnStatus,
        adminComment?: string,
    ) {
        this.logger.log(`${this.updateReturnRequestStatus.name} Service Called`);
        const returnRequest = await this.returnRepository.findOne({
            where: { id, tenantId },
        });

        if (!returnRequest) {
            throw new NotFoundException('Return request not found');
        }

        if (returnRequest.status === ReturnStatus.APPROVED || returnRequest.status === ReturnStatus.REFUNDED) {
            // Avoid double approval effects (restocking)
            // If moving from Approved -> Refunded, that's fine.
        }

        // Logic for APPROVAL
        if (status === ReturnStatus.APPROVED && returnRequest.status !== ReturnStatus.APPROVED) {
            await this.restockItems(returnRequest.items, tenantId);
        }


        returnRequest.status = status;
        if (adminComment) {
            returnRequest.adminComment = adminComment;
        }

        const saved = await this.returnRepository.save(returnRequest);
        return saved;
    }

    private async restockItems(items: any[], tenantId: string) {
        this.logger.log(`${this.restockItems.name} Service Called`);
        for (const item of items) {
            const { productId, variantId, quantity } = item;

            if (variantId) {
                const variant = await this.variantRepository.findOne({ where: { id: variantId, tenantId } });
                if (variant) {
                    variant.stock += quantity;
                    await this.variantRepository.save(variant);
                }
            } else {
                const product = await this.productRepository.findOne({ where: { id: productId, tenantId } });
                if (product) {
                    product.stock += quantity;
                    await this.productRepository.save(product);
                }
            }
        }
    }
}
