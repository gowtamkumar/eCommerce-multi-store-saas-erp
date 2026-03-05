import { BaseEntity } from 'src/common/base-entity/BaseEntity';
import { OrderStatus } from 'src/common/enums/order-status.enum';
import { PaymentMethod } from 'src/common/enums/payment-method.enum';
import { PaymentStatus } from 'src/common/enums/payment-status.enum';
import { TenantEntity } from 'src/modules/tenant/entities/tenant.entity';
import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToMany,
} from 'typeorm';
import { OrderItemEntity } from './order-item.entity';
import { OrderReturnEntity } from './order-return.entity';

@Entity('orders')
export class OrderEntity extends BaseEntity {
    @Column({ type: 'varchar', name: 'customer_name', length: 255 })
    customerName: string;

    @Column({ type: 'varchar', name: 'customer_email', length: 255 })
    customerEmail: string;

    @Column({ type: 'varchar', name: 'customer_phone', length: 50 })
    customerPhone: string;

    @Column({ type: 'text' })
    address: string;

    @OneToMany(() => OrderItemEntity, (item) => item.order, { cascade: true })
    items: OrderItemEntity[];

    @OneToMany(() => OrderReturnEntity, (returnRequest) => returnRequest.order)
    returns: OrderReturnEntity[];

    @Column({ type: 'decimal', name: 'total_amount', precision: 10, scale: 2 })
    totalAmount: number;

    @Column({ type: 'varchar', name: 'currency', length: 10, default: 'BDT' })
    currency: string;

    @Column({ type: 'decimal', name: 'currency_rate', precision: 10, scale: 4, default: 1 })
    currencyRate: number;

    @Column({
        type: 'enum',
        enum: OrderStatus,
        default: OrderStatus.PENDING,
    })
    status: OrderStatus;

    @Column({ type: 'enum', name: 'payment_method', enum: PaymentMethod })
    paymentMethod: PaymentMethod;

    @Column({
        name: 'payment_status',
        type: 'enum',
        enum: PaymentStatus,
        default: PaymentStatus.PENDING,
    })
    paymentStatus: PaymentStatus;

    @Column({ type: 'varchar', name: 'transaction_id', length: 255, nullable: true })
    transactionId: string;

    @Column({ type: 'text', name: 'order_notes', nullable: true })
    orderNotes: string;

    @Column({ type: 'uuid', name: 'user_id' })
    userId: string;

    @Column({ type: 'uuid', name: 'tenant_id' })
    tenantId: string;

    @ManyToOne(() => TenantEntity, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'tenant_id' })
    tenant: TenantEntity;

    @Column({ type: 'varchar', name: 'tracking_id', length: 255, nullable: true })
    trackingId: string;

    @Column({ type: 'varchar', name: 'courier_status', length: 255, nullable: true })
    courierStatus: string;

    @Column({ type: 'varchar', name: 'applied_coupon', length: 50, nullable: true })
    appliedCoupon: string;

    @Column({ type: 'decimal', name: 'coupon_discount_amount', precision: 10, scale: 2, default: 0 })
    couponDiscountAmount: number;
}

