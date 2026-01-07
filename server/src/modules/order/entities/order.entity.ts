import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { OrderStatus } from '../../../common/enums/order-status.enum';
import { PaymentMethod } from '../../../common/enums/payment-method.enum';
import { PaymentStatus } from '../../../common/enums/payment-status.enum';
import { ProductEntity } from '../../product/entities/product.entity';
import { TenantEntity } from '../../tenant/entities/tenant.entity';

@Entity('orders')
export class OrderEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 255 })
    customerName: string;

    @Column({ type: 'varchar', length: 255 })
    customerEmail: string;

    @Column({ type: 'varchar', length: 50 })
    customerPhone: string;

    @Column({ type: 'text' })
    address: string;

    @Column({ type: 'uuid' })
    productId: string;

    @ManyToOne(() => ProductEntity, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'productId' })
    product: ProductEntity;

    @Column({ type: 'int', default: 1 })
    quantity: number;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    unitPrice: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    discountAmount: number;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    totalAmount: number;

    @Column({ type: 'varchar', length: 10, default: 'BDT' })
    currency: string;

    @Column({ type: 'decimal', precision: 10, scale: 4, default: 1 })
    currencyRate: number;

    @Column({
        type: 'enum',
        enum: OrderStatus,
        default: OrderStatus.PENDING,
    })
    status: OrderStatus;

    @Column({ type: 'enum', enum: PaymentMethod })
    paymentMethod: PaymentMethod;

    @Column({
        type: 'enum',
        enum: PaymentStatus,
        default: PaymentStatus.PENDING,
    })
    paymentStatus: PaymentStatus;

    @Column({ type: 'varchar', length: 255, nullable: true })
    transactionId: string;

    @Column({ type: 'text', nullable: true })
    orderNotes: string;

    @Column({ type: 'uuid', nullable: true })
    userId: string;

    @Column({ type: 'uuid' })
    tenantId: string;

    @ManyToOne(() => TenantEntity, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'tenantId' })
    tenant: TenantEntity;

    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamptz' })
    updatedAt: Date;
}
