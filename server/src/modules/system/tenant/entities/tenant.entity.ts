import { BaseEntity } from 'src/common/base-entity/BaseEntity';
import { SubscriptionBillingCycle } from 'src/common/enums/subscription/billing-cycle.enum';
import { SubscriptionStatus } from 'src/common/enums/subscription/subscription-status.enum';
import { CustomDomainStatus } from 'src/common/enums/tenant/custom-domain-status';
import { TenantStatus } from 'src/common/enums/tenant/tenant-status.enum';
import { SubscriptionPlanEntity } from 'src/modules/system/subscription-plan/entities/subscription-plan.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

import { UserEntity } from 'src/modules/admin/core/user/entities/user.entity';
@Entity('tenants')
export class TenantEntity extends BaseEntity {


  @Column({ name: 'store_name' })
  storeName: string

  @Column({ name: 'subdomain', unique: true })
  subdomain: string

  @Column({ name: 'custom_domain', nullable: true, unique: true })
  customDomain: string

  @Column({
    name: 'custom_domain_status',
    type: 'enum',
    enum: CustomDomainStatus,
    default: CustomDomainStatus.PENDING,
  })
  customDomainStatus: CustomDomainStatus

  @Column({ name: 'custom_domain_verified_at', type: 'timestamptz', nullable: true })
  customDomainVerifiedAt: Date

  @Column({
    type: 'enum',
    enum: TenantStatus,
    default: TenantStatus.ACTIVE,
  })
  status: TenantStatus

  @Column({ name: 'ssl_enabled', default: false })
  sslEnabled: boolean



  @Column({ name: 'subscription_plan_id', nullable: true })
  subscriptionPlanId: string

  @ManyToOne(() => SubscriptionPlanEntity, (plan) => plan.tenants)
  @JoinColumn({ name: 'subscription_plan_id' })
  subscriptionPlan: SubscriptionPlanEntity

  @Column({
    name: 'subscription_billing_cycle',
    type: 'enum',
    enum: SubscriptionBillingCycle,
    default: SubscriptionBillingCycle.Monthly,
  })
  subscriptionBillingCycle: SubscriptionBillingCycle

  @Column({
    name: 'subscription_status',
    type: 'enum',
    enum: SubscriptionStatus,
    default: SubscriptionStatus.Active,
  })
  subscriptionStatus: SubscriptionStatus

  @Column({ name: 'subscription_starts_at', type: 'timestamptz', nullable: true })
  subscriptionStartsAt: Date

  @Column({ name: 'subscription_ends_at', type: 'timestamptz', nullable: true })
  subscriptionEndsAt: Date

  @Column({ type: 'uuid', name: 'user_id', nullable: true })
  userId: string;

  @ManyToOne(() => UserEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;
}
