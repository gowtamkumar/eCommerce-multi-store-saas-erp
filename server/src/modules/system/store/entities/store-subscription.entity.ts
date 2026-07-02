import { BaseEntity } from '@/common/base-entity/BaseEntity'
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm'
import { StoreEntity } from './store.entity'
import { SubscriptionPlanEntity } from '@/modules/system/subscription-plan/entities/subscription-plan.entity'
import { SubscriptionStatus } from '@/common/enums/subscription/subscription-status.enum'
import { SubscriptionBillingCycle } from '@/common/enums/subscription/billing-cycle.enum'

@Entity('store_subscriptions')
export class StoreSubscriptionEntity extends BaseEntity {
  @Column({ name: 'store_id' })
  storeId: string

  @ManyToOne(() => StoreEntity, (store) => store.subscriptions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'store_id' })
  store: StoreEntity

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
