import { BaseEntity } from 'src/common/base-entity/BaseEntity';
import { ReturnStatus } from 'src/common/enums/return-status.enum';
import { UserEntity } from 'src/modules/admin/user/entities/user.entity';
import { TenantEntity } from 'src/modules/tenant/entities/tenant.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { OrderEntity } from './order.entity';

@Entity('order_returns')
export class OrderReturnEntity extends BaseEntity {
    @Column({ type: 'uuid', name: 'order_id' })
    orderId: string;

    @ManyToOne(() => OrderEntity, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'order_id' })
    order: OrderEntity;

    @Column({ type: 'uuid', name: 'user_id' })
    userId: string;

    @ManyToOne(() => UserEntity, { onDelete: 'SET NULL' })
    @JoinColumn({ name: 'user_id' })
    user: UserEntity;

    @Column({
        type: 'enum',
        enum: ReturnStatus,
        default: ReturnStatus.PENDING,
    })
    status: ReturnStatus;

    @Column({ type: 'text' })
    reason: string;

    @Column({ type: 'text', name: 'admin_comment', nullable: true })
    adminComment: string;

    @Column({ type: 'decimal', name: 'refund_amount', precision: 10, scale: 2, nullable: true })
    refundAmount: number;

    // Stores which items are returned: [{ productId, variantId, quantity }]
    @Column({ type: 'jsonb' })
    items: any[];

    @Column({ type: 'uuid', name: 'tenant_id' })
    tenantId: string;

    @ManyToOne(() => TenantEntity, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'tenant_id' })
    tenant: TenantEntity;
}

