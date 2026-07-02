import { BaseEntity } from '@/common/base-entity/BaseEntity'
import { StoreEntity } from '@/modules/system/store/entities/store.entity'
import { UserEntity } from '@/modules/admin/core/user/entities/user.entity'
import { Column, Entity, OneToMany, ManyToOne, JoinColumn } from 'typeorm'
import { SubscriptionBillingCycle } from '@/common/enums/subscription/billing-cycle.enum'

@Entity('subscription_plans')
export class SubscriptionPlanEntity extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  name: string

  @Column({ type: 'text', nullable: true })
  description: string

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, name: 'monthly_price' })
  monthlyPrice: number

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, name: 'yearly_price' })
  yearlyPrice: number

  @Column({
    type: 'enum',
    enum: SubscriptionBillingCycle,
    default: SubscriptionBillingCycle.MONTHLY,
    name: 'billing_cycle',
  })
  billingCycle: SubscriptionBillingCycle

  @Column({ type: 'jsonb', default: [] })
  features: string[]

  @Column({ name: 'is_active', default: true })
  isActive: boolean

  @Column({ name: 'is_popular', default: false })
  isPopular: boolean

  @Column({ name: 'trial_period_days', type: 'int', default: 14 })
  trialPeriodDays: number

  @Column({ type: 'varchar', unique: true, nullable: true })
  code: string

  @Column({ type: 'varchar', length: 3, default: 'USD' })
  currency: string

  @Column({ name: 'max_branches', type: 'int', default: 1 })
  maxBranches: number

  @Column({ name: 'max_warehouses', type: 'int', default: 1 })
  maxWarehouses: number

  @Column({ name: 'max_staff_users', type: 'int', default: 3 })
  maxStaffUsers: number

  @Column({ name: 'max_products', type: 'int', default: 100 })
  maxProducts: number

  @Column({ name: 'max_monthly_orders', type: 'int', default: 500 })
  maxMonthlyOrders: number

  @Column({ name: 'max_storage_mb', type: 'int', default: 1024 })
  maxStorageMb: number

  // when payment by stripe these field are used
  @Column({ name: 'stripe_price_id_monthly', type: 'varchar', nullable: true })
  stripePriceIdMonthly: string
  // when payment by stripe these field are used
  @Column({ name: 'stripe_price_id_yearly', type: 'varchar', nullable: true })
  stripePriceIdYearly: string

  @OneToMany(() => StoreEntity, (store) => store.subscriptionPlan)
  stores: StoreEntity[]

  @ManyToOne(() => UserEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity
}
