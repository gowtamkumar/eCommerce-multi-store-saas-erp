import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { ReturnStatus } from '../../../common/enums/return-status.enum';
import { UserEntity } from '../../admin/user/entities/user.entity';
import { TenantEntity } from '../../tenant/entities/tenant.entity';
import { OrderEntity } from './order.entity';

@Entity('order_returns')
export class OrderReturnEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    orderId: string;

    @ManyToOne(() => OrderEntity, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'orderId' })
    order: OrderEntity;

    @Column({ type: 'uuid', nullable: true })
    userId: string;

    @ManyToOne(() => UserEntity, { onDelete: 'SET NULL' })
    @JoinColumn({ name: 'userId' })
    user: UserEntity;

    @Column({
        type: 'enum',
        enum: ReturnStatus,
        default: ReturnStatus.PENDING,
    })
    status: ReturnStatus;

    @Column({ type: 'text' })
    reason: string;

    @Column({ type: 'text', nullable: true })
    adminComment: string;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    refundAmount: number;

    // Stores which items are returned: [{ productId, variantId, quantity }]
    @Column({ type: 'jsonb' })
    items: any[];

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
