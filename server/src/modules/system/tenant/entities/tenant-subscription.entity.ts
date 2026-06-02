import { BaseEntity } from '@/common/base-entity/BaseEntity'
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm'
import { TenantEntity } from './tenant.entity'
import { SubscriptionPlanEntity } from '@/modules/system/subscription-plan/entities/subscription-plan.entity'
import { SubscriptionStatus } from '@/common/enums/subscription/subscription-status.enum'
import { SubscriptionBillingCycle } from '@/common/enums/subscription/billing-cycle.enum'

@Entity('tenant_subscriptions')
export class TenantSubscriptionEntity extends BaseEntity {
  @Column({ name: 'tenant_id' })
  tenantId: string

  @ManyToOne(() => TenantEntity, (tenant) => tenant.subscriptions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: TenantEntity

  @Column({ name: 'subscription_plan_id' })
  subscriptionPlanId: string

  @ManyToOne(() => SubscriptionPlanEntity)
  @JoinColumn({ name: 'subscription_plan_id' })
  subscriptionPlan: SubscriptionPlanEntity

  @Column({
    type: 'enum',
    enum: SubscriptionStatus,
    default: SubscriptionStatus.ACTIVE,
    name: 'status',
  })
  status: SubscriptionStatus

  @Column({
    type: 'enum',
    enum: SubscriptionBillingCycle,
    default: SubscriptionBillingCycle.MONTHLY,
    name: 'billing_cycle',
  })
  billingCycle: SubscriptionBillingCycle

  @Column({ name: 'starts_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  startsAt: Date

  @Column({ name: 'ends_at', type: 'timestamptz', nullable: true })
  endsAt: Date | null

  @Column({ name: 'stripe_subscription_id', type: 'varchar', length: 255, nullable: true })
  stripeSubscriptionId: string | null

  @Column({ name: 'stripe_customer_id', type: 'varchar', length: 255, nullable: true })
  stripeCustomerId: string | null

  @Column({ name: 'cancel_at_period_end', type: 'boolean', default: false })
  cancelAtPeriodEnd: boolean
}
