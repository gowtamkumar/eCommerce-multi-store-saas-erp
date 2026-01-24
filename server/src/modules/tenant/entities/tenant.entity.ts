import { Column, CreateDateColumn, Entity, ManyToOne, JoinColumn, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'
import { SubscriptionBillingCycle } from '../../../common/enums/subscription/billing-cycle.enum'
import { SubscriptionStatus } from '../../../common/enums/subscription/subscription-status.enum'
import { SubscriptionPlanEntity } from '../../subscription-plan/entities/subscription-plan.entity'

@Entity('tenants')
export class TenantEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'varchar', length: 255 })
  storeName: string

  @Column({ type: 'varchar', length: 100, unique: true })
  subdomain: string

  @Column({ type: 'varchar', length: 255, nullable: true, unique: true })
  customDomain: string

  @Column({
    type: 'enum',
    enum: ['pending', 'verified', 'active'],
    default: 'pending',
  })
  customDomainStatus: string

  @Column({ type: 'timestamptz', nullable: true })
  customDomainVerifiedAt: Date

  @Column({
    type: 'enum',
    enum: ['active', 'suspended', 'archived'],
    default: 'active',
  })
  status: string

  @Column({ default: false })
  sslEnabled: boolean

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date

  @Column({ nullable: true })
  subscriptionPlanId: string

  @ManyToOne(() => SubscriptionPlanEntity, (plan) => plan.tenants)
  @JoinColumn({ name: 'subscriptionPlanId' })
  subscriptionPlan: SubscriptionPlanEntity

  @Column({
    type: 'enum',
    enum: SubscriptionBillingCycle,
    default: SubscriptionBillingCycle.Monthly,
  })
  subscriptionBillingCycle: SubscriptionBillingCycle

  @Column({
    type: 'enum',
    enum: SubscriptionStatus,
    default: SubscriptionStatus.Active,
  })
  subscriptionStatus: SubscriptionStatus

  @Column({ type: 'timestamptz', nullable: true })
  subscriptionStartsAt: Date

  @Column({ type: 'timestamptz', nullable: true })
  subscriptionEndsAt: Date
}
