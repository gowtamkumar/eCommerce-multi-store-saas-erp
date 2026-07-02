import { BaseEntity } from '@/common/base-entity/BaseEntity'
import { StoreAiConfig } from '@/common/types/store-ai-config.types'
import { SubscriptionBillingCycle } from '@/common/enums/subscription/billing-cycle.enum'
import { SubscriptionStatus } from '@/common/enums/subscription/subscription-status.enum'
import { CustomDomainStatus } from '@/common/enums/store/custom-domain-status'
import { StoreStatus } from '@/common/enums/store/store-status.enum'
import { StoreDomainEntity } from './store-domain.entity'
import { StoreSubscriptionEntity } from './store-subscription.entity'
import { UserEntity } from '@/modules/admin/core/user/entities/user.entity'
import { SubscriptionPlanEntity } from '@/modules/system/subscription-plan/entities/subscription-plan.entity'
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm'

@Entity('stores')
export class StoreEntity extends BaseEntity {
  @Column({ name: 'store_name' })
  storeName: string

  @Column({ name: 'subdomain', unique: true })
  subdomain: string

  @OneToMany(() => StoreDomainEntity, (domain) => domain.store)
  domains: StoreDomainEntity[]

  @Column({
    type: 'enum',
    enum: StoreStatus,
    default: StoreStatus.ACTIVE,
  })
  status: StoreStatus

  @Column({ name: 'ssl_enabled', default: false })
  sslEnabled: boolean

  @Column({ type: 'jsonb', name: 'ai_config', nullable: true })
  aiConfig?: StoreAiConfig | null

  // accountingStandard is the standard used for accounting
  @Column({ name: 'accounting_standard', length: 50, nullable: true })
  accountingStandard: string | null
  // activeSubscriptionId is the id of the active subscription
  @Column({ name: 'active_subscription_id', type: 'uuid', nullable: true })
  activeSubscriptionId: string | null

  @ManyToOne(() => StoreSubscriptionEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'active_subscription_id' })
  activeSubscription: StoreSubscriptionEntity

  @OneToMany(() => StoreSubscriptionEntity, (sub) => sub.store)
  subscriptions: StoreSubscriptionEntity[]

  @ManyToOne(() => UserEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity

  get subscriptionPlan(): SubscriptionPlanEntity | null {
    return this.activeSubscription?.subscriptionPlan || null
  }

  get subscriptionPlanId(): string | null {
    return this.activeSubscription?.subscriptionPlanId || null
  }

  get subscriptionStatus(): SubscriptionStatus | null {
    return this.activeSubscription?.status || null
  }

  get subscriptionBillingCycle(): SubscriptionBillingCycle | null {
    return this.activeSubscription?.billingCycle || null
  }

  get subscriptionStartsAt(): Date | null {
    return this.activeSubscription?.startsAt || null
  }

  get subscriptionEndsAt(): Date | null {
    return this.activeSubscription?.endsAt || null
  }

  get primaryCustomDomain(): string | null {
    if (!this.domains) return null
    const primary = this.domains.find((d) => d.isPrimary && d.status === CustomDomainStatus.ACTIVE)
    if (primary) return primary.hostname
    const firstActive = this.domains.find((d) => d.status === CustomDomainStatus.ACTIVE)
    return firstActive ? firstActive.hostname : null
  }

  get isExpired(): boolean {
    if (!this.activeSubscription || !this.activeSubscription.endsAt) return false
    return new Date() > new Date(this.activeSubscription.endsAt)
  }
}
