import { BaseEntity } from '@/common/base-entity/BaseEntity'
import { SubscriptionBillingCycle } from '@/common/enums/subscription/billing-cycle.enum'
import { SubscriptionStatus } from '@/common/enums/subscription/subscription-status.enum'
import { CustomDomainStatus } from '@/common/enums/tenant/custom-domain-status'
import { TenantStatus } from '@/common/enums/tenant/tenant-status.enum'
import { TenantDomainEntity } from './tenant-domain.entity'
import { TenantSubscriptionEntity } from './tenant-subscription.entity'
import { UserEntity } from '@/modules/admin/core/user/entities/user.entity'
import { SubscriptionPlanEntity } from '@/modules/system/subscription-plan/entities/subscription-plan.entity'
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm'

@Entity('tenants')
export class TenantEntity extends BaseEntity {
  @Column({ name: 'store_name' })
  storeName: string

  @Column({ name: 'subdomain', unique: true })
  subdomain: string

  @OneToMany(() => TenantDomainEntity, (domain) => domain.tenant)
  domains: TenantDomainEntity[]

  @Column({
    type: 'enum',
    enum: TenantStatus,
    default: TenantStatus.ACTIVE,
  })
  status: TenantStatus

  @Column({ name: 'ssl_enabled', default: false })
  sslEnabled: boolean

  @Column({ name: 'active_subscription_id', type: 'uuid', nullable: true })
  activeSubscriptionId: string | null

  @ManyToOne(() => TenantSubscriptionEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'active_subscription_id' })
  activeSubscription: TenantSubscriptionEntity

  @OneToMany(() => TenantSubscriptionEntity, (sub) => sub.tenant)
  subscriptions: TenantSubscriptionEntity[]

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
