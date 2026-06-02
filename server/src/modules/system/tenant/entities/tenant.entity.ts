import { BaseEntity } from '@/common/base-entity/BaseEntity'
import { SubscriptionBillingCycle } from '@/common/enums/subscription/billing-cycle.enum'
import { SubscriptionStatus } from '@/common/enums/subscription/subscription-status.enum'
import { CustomDomainStatus } from '@/common/enums/tenant/custom-domain-status'
import { TenantStatus } from '@/common/enums/tenant/tenant-status.enum'
import { TenantDomainEntity } from './tenant-domain.entity'
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

  @Column({ name: 'subscription_plan_id', nullable: true })
  subscriptionPlanId: string

  @ManyToOne(() => SubscriptionPlanEntity, (plan) => plan.tenants)
  @JoinColumn({ name: 'subscription_plan_id' })
  subscriptionPlan: SubscriptionPlanEntity

  @Column({
    name: 'subscription_billing_cycle',
    type: 'enum',
    enum: SubscriptionBillingCycle,
    default: SubscriptionBillingCycle.MONTHLY,
  })
  subscriptionBillingCycle: SubscriptionBillingCycle

  @Column({
    name: 'subscription_status',
    type: 'enum',
    enum: SubscriptionStatus,
    default: SubscriptionStatus.ACTIVE,
  })
  subscriptionStatus: SubscriptionStatus

  @Column({ name: 'subscription_starts_at', type: 'timestamptz', nullable: true })
  subscriptionStartsAt: Date

  @Column({ name: 'subscription_ends_at', type: 'timestamptz', nullable: true })
  subscriptionEndsAt: Date

  @ManyToOne(() => UserEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity

  get primaryCustomDomain(): string | null {
    if (!this.domains) return null
    const primary = this.domains.find((d) => d.isPrimary && d.status === CustomDomainStatus.ACTIVE)
    if (primary) return primary.hostname
    const firstActive = this.domains.find((d) => d.status === CustomDomainStatus.ACTIVE)
    return firstActive ? firstActive.hostname : null
  }

  get isExpired(): boolean {
    if (!this.subscriptionEndsAt) return false
    return new Date() > new Date(this.subscriptionEndsAt)
  }
}
