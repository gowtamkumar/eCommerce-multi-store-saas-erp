import { BaseEntity } from 'src/common/base-entity/BaseEntity';
import { TenantEntity } from 'src/modules/tenant/entities/tenant.entity';
import {
    Column,
    Entity,
    OneToMany,
} from 'typeorm';

@Entity('subscription_plans')
export class SubscriptionPlanEntity extends BaseEntity {

    @Column({ type: 'varchar', length: 255 })
    name: string

    @Column({ type: 'text', nullable: true })
    description: string

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    price: number

    @Column({ type: 'jsonb', default: [] })
    features: string[]

    @Column({ name: 'is_active', default: true })
    isActive: boolean

    @OneToMany(() => TenantEntity, (tenant) => tenant.subscriptionPlan)
    tenants: TenantEntity[]


}
