import { BaseEntity } from 'src/common/base-entity/BaseEntity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { TenantEntity } from '../../tenant/entities/tenant.entity';

import { UserEntity } from 'src/modules/admin/user/entities/user.entity';
export enum PromotionType {
    PERCENTAGE = 'percentage',
    FIXED_AMOUNT = 'fixed_amount',
    FREE_SHIPPING = 'free_shipping',
    BOGO = 'bogo',
}

export enum PromotionTargetType {
    ENTIRE_ORDER = 'entire_order',
    SPECIFIC_PRODUCT = 'specific_product',
    SPECIFIC_CATEGORY = 'specific_category',
    SPECIFIC_BRAND = 'specific_brand',
    MINIMUM_CART_VALUE = 'minimum_cart_value',
}

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
