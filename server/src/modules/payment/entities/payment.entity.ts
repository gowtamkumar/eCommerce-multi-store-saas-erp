import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { OrderEntity } from '../../order/entities/order.entity';
import { TenantEntity } from '../../tenant/entities/tenant.entity';

@Entity('payments')
export class PaymentEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    orderId: string;

    @ManyToOne(() => OrderEntity, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'orderId' })
    order: OrderEntity;

    @Column({ type: 'varchar', length: 255 })
    transactionId: string;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    amount: number;

    @Column({ type: 'varchar', length: 10, default: 'BDT' })
    currency: string;

    @Column({ type: 'varchar', length: 50 })
    method: string;

    @Column({ type: 'varchar', length: 50 })
    status: string;

    @Column({ type: 'jsonb', nullable: true })
    gatewayResponse: any;

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
