import { BaseEntity } from 'src/common/base-entity/BaseEntity';
import { TenantEntity } from 'src/modules/tenant/entities/tenant.entity';

import { UserEntity } from 'src/modules/admin/user/entities/user.entity';
import { Column, Entity, OneToMany, ManyToOne, JoinColumn } from 'typeorm';

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



  @Column({ type: 'uuid', name: 'user_id', nullable: true })
  userId: string;

  @ManyToOne(() => UserEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;
}
