import { BaseEntity } from '@/common/base-entity/BaseEntity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { UserEntity } from '@/modules/admin/core/user/entities/user.entity';
import { PromotionType } from '../enums/promotion-type.enum';
import { PromotionTargetType } from '../enums/promotion-target-type.enum';
import { TenantEntity } from '@/modules/system/tenant/entities/tenant.entity';

@Entity('promotions')
export class PromotionEntity extends BaseEntity {
    @Column({ type: 'varchar', length: 255 })
    name: string;

    @Column({ unique: true })
    slug: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ type: 'enum', enum: PromotionType, default: PromotionType.PERCENTAGE })
    promotionType: PromotionType;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    value: number;

    @Column({ type: 'enum', enum: PromotionTargetType, default: PromotionTargetType.ENTIRE_ORDER })
    targetType: PromotionTargetType;

    @Column({ type: 'uuid', name: 'target_id', nullable: true })
    targetId: string;

    @Column({ type: 'decimal', name: 'min_order_value', precision: 10, scale: 2, nullable: true })
    minOrderValue: number;

    @Column({ type: 'timestamp', name: 'start_date', nullable: true })
    startDate: Date;

    @Column({ type: 'timestamp', name: 'end_date', nullable: true })
    endDate: Date;

    @Column({ type: 'boolean', name: 'is_active', default: true })
    isActive: boolean;

    @Column({ type: 'uuid', name: 'tenant_id' })
    tenantId: string;

    @ManyToOne(() => TenantEntity, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'tenant_id' })
    tenant: TenantEntity;

    @Column({ type: 'uuid', name: 'user_id', nullable: true })
    userId: string;

    @ManyToOne(() => UserEntity, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'user_id' })
    user: UserEntity;
}
