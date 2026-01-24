import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LeadStatus } from '../../common/enums/lead-status.enum';
import { OrderStatus } from '../../common/enums/order-status.enum';
import { PaymentStatus } from '../../common/enums/payment-status.enum';
import { UserEntity } from '../admin/user/entities/user.entity';
import { CartService } from '../cart/cart.service';
import { LeadEntity } from '../lead/entities/lead.entity';
import { PaymentEntity } from '../payment/entities/payment.entity';
import { ProductEntity } from '../product/entities/product.entity';
import { ProductVariantEntity } from '../product/entities/variant.entity';
import { SiteSettingsEntity } from '../settings/entities/site-settings.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { OrderItemEntity } from './entities/order-item.entity';
import { OrderEntity } from './entities/order.entity';

@Injectable()
export class OrderService {
    constructor(
        @InjectRepository(OrderEntity)
        private orderRepository: Repository<OrderEntity>,
        @InjectRepository(ProductEntity)
        private productRepository: Repository<ProductEntity>,
        @InjectRepository(ProductVariantEntity)
        private variantRepository: Repository<ProductVariantEntity>,
        @InjectRepository(UserEntity)
        private userRepository: Repository<UserEntity>,
        @InjectRepository(LeadEntity)
        private leadRepository: Repository<LeadEntity>,
        @InjectRepository(SiteSettingsEntity)
        private settingsRepository: Repository<SiteSettingsEntity>,
        @InjectRepository(PaymentEntity)
        private paymentRepository: Repository<PaymentEntity>,
        private cartService: CartService,
    ) { }

    async create(createOrderDto: CreateOrderDto, tenantId: string) {
        const {
            customerName,
            customerEmail,
            customerPhone,
            address,
            items,
            paymentMethod,
            orderNotes,
            currency,
            currencyRate,
        } = createOrderDto;

        if (!items || items.length === 0) {
            throw new BadRequestException('Order must contain at least one item');
        }

        // Get settings for currency
        const settings = await this.settingsRepository.findOne({
            where: { tenantId },
        });

        // Find or create lead/user
        const user = await this.userRepository.findOne({
            where: { email: customerEmail, tenantId },
        });

        if (!user) {
            // Create lead
            await this.leadRepository.save({
                name: customerName,
                email: customerEmail,
                phone: customerPhone,
                address,
                subject: 'New lead from order',
                message: 'New lead from order',
                status: LeadStatus.NEW,
                tenantId,
            });
        }

        // Create initial order
        const order = this.orderRepository.create({
            customerName,
            customerEmail,
            customerPhone,
            address,
            items: [],
            totalAmount: 0, // Will be calculated
            currency: currency || settings?.currency || 'USD',
            currencyRate: currencyRate || 1,
            paymentMethod,
            status: OrderStatus.PENDING,
            paymentStatus: PaymentStatus.PENDING,
            orderNotes,
            userId: user?.id,
            tenantId,
        });

        let totalOrderAmount = 0;
        const processedItems: OrderItemEntity[] = [];

        // Process each item
        for (const itemDto of items) {
            const product = await this.productRepository.findOne({
                where: { id: itemDto.productId, tenantId },
            });

            if (!product) {
                throw new NotFoundException(`Product with ID ${itemDto.productId} not found`);
            }

            let variant: ProductVariantEntity | null = null;
            if (itemDto.variantId) {
                variant = await this.variantRepository.findOne({
                    where: { id: itemDto.variantId, productId: product.id, tenantId },
                });
                if (!variant) {
                    throw new NotFoundException(`Variant with ID ${itemDto.variantId} not found for product ${product.name}`);
                }
            }

            const currentStock = variant ? variant.stock : product.stock;
            if (currentStock < itemDto.quantity) {
                throw new BadRequestException(
                    `Insufficient stock for ${product.name}${variant ? ' (Variant)' : ''}. Only ${currentStock} items available.`,
                );
            }

            const unitPrice = variant?.price ? Number(variant.price) : Number(product.price);
            const discountAmount = Number(product.discountAmount) || 0;
            const itemTotal = (unitPrice - discountAmount) * itemDto.quantity;

            const orderItem = new OrderItemEntity();
            orderItem.product = product;
            orderItem.variant = variant;
            orderItem.quantity = itemDto.quantity;
            orderItem.unitPrice = unitPrice;
            orderItem.discountAmount = discountAmount;
            orderItem.totalAmount = itemTotal;
            orderItem.tenantId = tenantId;

            processedItems.push(orderItem);
            totalOrderAmount += itemTotal;

            // Decrement stock
            if (variant) {
                variant.stock -= itemDto.quantity;
                await this.variantRepository.save(variant);
            } else {
                product.stock -= itemDto.quantity;
                await this.productRepository.save(product);
            }
        }

        order.totalAmount = totalOrderAmount;
        order.items = processedItems;

        const savedOrder = await this.orderRepository.save(order);

        // Clear cart if user exists
        if (user && user.id) {
            await this.cartService.clearCart(user.id, tenantId);
        }

        return { success: true, order: savedOrder };
    }

    async findAll(filterDto: any, tenantId: string) {
        const { page, limit, q, status } = filterDto;
        const skip = (page - 1) * limit;

        const queryBuilder = this.orderRepository
            .createQueryBuilder('order')
            .leftJoinAndSelect('order.items', 'items')
            .leftJoinAndSelect('items.product', 'product')
            .leftJoinAndSelect('items.variant', 'variant')
            .where('order.tenantId = :tenantId', { tenantId });

        if (status) {
            queryBuilder.andWhere('order.status = :status', { status });
        }

        if (q) {
            queryBuilder.andWhere(
                '(order.customerName ILIKE :q OR order.customerEmail ILIKE :q)',
                { q: `%${q}%` },
            );
        }

        const [orders, total] = await queryBuilder
            .orderBy('order.createdAt', 'DESC')
            .skip(skip)
            .take(limit)
            .getManyAndCount();

        return {
            orders,
            total,
        };
    }

    async findOne(id: string, tenantId: string) {
        const order = await this.orderRepository.findOne({
            where: { id, tenantId },
            relations: ['items', 'items.product', 'items.variant'],
        });

        if (!order) {
            throw new NotFoundException('Order not found');
        }

        return order;
    }

    async findByUserId(userId: string, tenantId: string) {
        const orders = await this.orderRepository.find({
            where: { userId, tenantId },
            relations: ['items', 'items.product', 'items.variant'],
            order: { createdAt: 'DESC' },
        });

        return orders;
    }

    async update(id: string, updateOrderDto: UpdateOrderDto, tenantId: string) {
        const order = await this.findOne(id, tenantId);

        // Check if payment status is changing to PAID
        if (
            updateOrderDto.paymentStatus === PaymentStatus.PAID &&
            order.paymentStatus !== PaymentStatus.PAID
        ) {
            // Create payment record for manual update (e.g. COD)
            const transactionId = updateOrderDto.transactionId || order.transactionId || `MANUAL_COD_${Date.now()}`;

            // Check if payment already exists
            const existingPayment = await this.paymentRepository.findOne({
                where: { transactionId, tenantId },
            });

            if (!existingPayment) {
                const payment = this.paymentRepository.create({
                    orderId: order.id,
                    transactionId,
                    amount: order.totalAmount,
                    currency: order.currency,
                    method: order.paymentMethod || 'Manual',
                    status: 'SUCCESS',
                    gatewayResponse: { note: 'Manual update from admin dashboard' },
                    tenantId,
                });
                await this.paymentRepository.save(payment);
            }
        }

        Object.assign(order, updateOrderDto);
        return await this.orderRepository.save(order);
    }


    async findAllOrders() {
        return await this.orderRepository.find({
            order: { createdAt: 'DESC' },
        });
    }

    async countByTenant(tenantId: string) {
        return await this.orderRepository.count({ where: { tenantId } });
    }
}
