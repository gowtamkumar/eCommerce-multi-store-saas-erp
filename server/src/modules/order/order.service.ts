import {
    Injectable,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { OrderEntity } from './entities/order.entity';
import { ProductEntity } from '../product/entities/product.entity';
import { UserEntity } from '../admin/user/entities/user.entity';
import { LeadEntity } from '../lead/entities/lead.entity';
import { SiteSettingsEntity } from '../settings/entities/site-settings.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { OrderStatus } from '../../common/enums/order-status.enum';
import { PaymentStatus } from '../../common/enums/payment-status.enum';
import { LeadStatus } from '../../common/enums/lead-status.enum';
import { PaymentEntity } from '../payment/entities/payment.entity';

@Injectable()
export class OrderService {
    constructor(
        @InjectRepository(OrderEntity)
        private orderRepository: Repository<OrderEntity>,
        @InjectRepository(ProductEntity)
        private productRepository: Repository<ProductEntity>,
        @InjectRepository(UserEntity)
        private userRepository: Repository<UserEntity>,
        @InjectRepository(LeadEntity)
        private leadRepository: Repository<LeadEntity>,
        @InjectRepository(SiteSettingsEntity)
        private settingsRepository: Repository<SiteSettingsEntity>,
        @InjectRepository(PaymentEntity)
        private paymentRepository: Repository<PaymentEntity>,
    ) { }

    async create(createOrderDto: CreateOrderDto, tenantId: string) {
        const {
            customerName,
            customerEmail,
            customerPhone,
            address,
            productId,
            quantity,
            paymentMethod,
            orderNotes,
            currency,
            currencyRate,
        } = createOrderDto;

        // Validate quantity
        if (quantity <= 0) {
            throw new BadRequestException('Invalid quantity');
        }

        // Get product and check stock
        const product = await this.productRepository.findOne({
            where: { id: productId, tenantId },
        });

        if (!product) {
            throw new NotFoundException('Product not found');
        }

        if (product.stock < quantity) {
            throw new BadRequestException(
                `Insufficient stock. Only ${product.stock} items available.`,
            );
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

        // Calculate order totals
        const unitPrice = product.price;
        const discountAmount = product.discountAmount || 0;
        const totalAmount = (unitPrice - discountAmount) * quantity;

        // Create order
        const order = this.orderRepository.create({
            customerName,
            customerEmail,
            customerPhone,
            address,
            productId,
            quantity,
            unitPrice,
            discountAmount,
            totalAmount,
            currency: currency || settings?.currency || 'USD',
            currencyRate: currencyRate || 1,
            paymentMethod,
            status: OrderStatus.PENDING,
            paymentStatus: PaymentStatus.PENDING,
            orderNotes,
            userId: user?.id,
            tenantId,
        });

        const savedOrder = await this.orderRepository.save(order);

        // Decrement stock
        product.stock -= quantity;
        await this.productRepository.save(product);

        return { success: true, order: savedOrder };
    }

    async findAll(filterDto: any, tenantId: string) {
        const { page, limit, q, status } = filterDto;
        const skip = (page - 1) * limit;

        const queryBuilder = this.orderRepository
            .createQueryBuilder('order')
            .leftJoinAndSelect('order.product', 'product')
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
            relations: ['product'],
        });

        if (!order) {
            throw new NotFoundException('Order not found');
        }

        return order;
    }

    async findByUserId(userId: string, tenantId: string) {
        const orders = await this.orderRepository.find({
            where: { userId, tenantId },
            relations: ['product'],
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

    async findByUser(userId: string, tenantId: string) {
        return await this.orderRepository.find({
            where: { userId, tenantId },
            relations: ['product'],
            order: { createdAt: 'DESC' },
        });
    }

    async findAllOrders() {
        return await this.orderRepository.find({
            order: { createdAt: 'DESC' },
        });
    }
}
