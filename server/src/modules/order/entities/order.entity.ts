import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { OrderStatus } from '../../../common/enums/order-status.enum';
import { PaymentMethod } from '../../../common/enums/payment-method.enum';
import { PaymentStatus } from '../../../common/enums/payment-status.enum';
import { TenantEntity } from '../../tenant/entities/tenant.entity';
import { OrderItemEntity } from './order-item.entity';
import { OrderReturnEntity } from './order-return.entity';

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

    @OneToMany(() => OrderItemEntity, (item) => item.order, { cascade: true })
    items: OrderItemEntity[];

    @OneToMany(() => OrderReturnEntity, (returnRequest) => returnRequest.order)
    returns: OrderReturnEntity[];

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
