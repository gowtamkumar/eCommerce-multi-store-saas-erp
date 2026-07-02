import { BaseEntity } from '@/common/base-entity/BaseEntity'
import { SubscriptionBillingCycle } from '@/common/enums/subscription/billing-cycle.enum'
import { PaymentStatus } from '@/common/enums/payment-status.enum'
import { SubscriptionPlanEntity } from '@/modules/system/subscription-plan/entities/subscription-plan.entity'
import { StoreEntity } from '@/modules/system/store/entities/store.entity'
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm'

@Entity('subscription_invoices')
export class SubscriptionInvoiceEntity extends BaseEntity {
  @Column({ type: 'varchar', name: 'invoice_number', unique: true, length: 100 })
  invoiceNumber: string

  @Column({ type: 'uuid', name: 'store_id' })
  storeId: string

  @ManyToOne(() => StoreEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'store_id' })
  store: StoreEntity

  @Column({ type: 'uuid', name: 'subscription_plan_id' })
  subscriptionPlanId: string

  @ManyToOne(() => SubscriptionPlanEntity)
  @JoinColumn({ name: 'subscription_plan_id' })
  subscriptionPlan: SubscriptionPlanEntity

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number

  @Column({ type: 'varchar', length: 10, default: 'USD' })
  currency: string

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  status: PaymentStatus

  @Column({ name: 'transaction_id', nullable: true })
  transactionId: string

  @Column({ name: 'billing_date', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  billingDate: Date

  @Column({ name: 'payment_url', type: 'text', nullable: true })
  paymentUrl: string

  @Column({ name: 'gateway_response', type: 'jsonb', nullable: true })
  gatewayResponse: any

  @Column({
    type: 'enum',
    enum: SubscriptionBillingCycle,
    default: SubscriptionBillingCycle.MONTHLY,
    name: 'billing_cycle',
  })
  billingCycle: SubscriptionBillingCycle
}
