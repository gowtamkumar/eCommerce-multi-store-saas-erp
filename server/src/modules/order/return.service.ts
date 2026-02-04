import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReturnStatus } from '../../common/enums/return-status.enum';
import { ProductEntity } from '../product/entities/product.entity';
import { ProductVariantEntity } from '../product/entities/variant.entity';
import { CreateReturnDto } from './dto/create-return.dto';
import { OrderReturnEntity } from './entities/order-return.entity';
import { OrderEntity } from './entities/order.entity';

@Injectable()
export class ReturnService {
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

    async createRequest(userId: string, tenantId: string, dto: CreateReturnDto) {
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
        for (const returnItem of items) {
            console.log("Looking for:", returnItem);
            console.log("In order items:", order.items.map(i => ({ pid: i.productId, vid: i.variantId })));

            const orderItem = order.items.find(
                (oi) =>
                    oi.productId === returnItem.productId &&
                    (oi.variantId === returnItem.variantId ||
                        (!oi.variantId && !returnItem.variantId))
            );

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

    async findAll(tenantId: string) {
        console.log("tenantId", tenantId);

        const returns = await this.returnRepository.find({
            where: { tenantId },
            order: { createdAt: 'DESC' },
            relations: ['order', 'user'],
        });
        console.log("returns", returns);
        return returns;
    }

    async findByUser(userId: string, tenantId: string) {
        return await this.returnRepository.find({
            where: { userId, tenantId },
            order: { createdAt: 'DESC' },
            relations: ['order'],
        });
    }

    async updateStatus(
        id: string,
        tenantId: string,
        status: ReturnStatus,
        adminComment?: string,
    ) {
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

        return await this.returnRepository.save(returnRequest);
    }

    private async restockItems(items: any[], tenantId: string) {
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
