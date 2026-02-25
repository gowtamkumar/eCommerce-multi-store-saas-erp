import { SubscriptionBillingCycle } from 'src/common/enums/subscription/billing-cycle.enum'
import { SubscriptionStatus } from 'src/common/enums/subscription/subscription-status.enum'
import { SubscriptionPlanEntity } from 'src/modules/system-platform/subscription-plan/entities/subscription-plan.entity'
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'

@Entity('tenants')
export class TenantEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string


  @Column({ name: 'store_name' })
  storeName: string

  @Column({ name: 'subdomain', unique: true })
  subdomain: string

  @Column({ name: 'custom_domain', nullable: true, unique: true })
  customDomain: string

  @Column({
    name: 'custom_domain_status',
    type: 'enum',
    enum: ['pending', 'verified', 'active'],
    default: 'pending',
  })
  customDomainStatus: string

  @Column({ name: 'custom_domain_verified_at', type: 'timestamptz', nullable: true })
  customDomainVerifiedAt: Date

  @Column({
    type: 'enum',
    enum: ['active', 'suspended', 'archived'],
    default: 'active',
  })
  status: string

  @Column({ name: 'ssl_enabled', default: false })
  sslEnabled: boolean

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date

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
}
