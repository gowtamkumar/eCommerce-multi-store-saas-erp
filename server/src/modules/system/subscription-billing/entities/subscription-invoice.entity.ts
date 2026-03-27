import { BaseEntity } from '@/common/base-entity/BaseEntity'
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm'
import { TenantEntity } from '@/modules/system/tenant/entities/tenant.entity'
import { SubscriptionPlanEntity } from '@/modules/system/subscription-plan/entities/subscription-plan.entity'
import { PaymentStatus } from '@/common/enums/payment-status.enum'

@Entity('subscription_invoices')
export class SubscriptionInvoiceEntity extends BaseEntity {
  @Column({ type: 'varchar', name: 'invoice_number', unique: true, length: 100 })
  invoiceNumber: string

  @Column({ type: 'uuid', name: 'tenant_id' })
  tenantId: string

  @ManyToOne(() => TenantEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: TenantEntity

  @Column({ type: 'uuid', name: 'plan_id' })
  planId: string

  @ManyToOne(() => SubscriptionPlanEntity)
  @JoinColumn({ name: 'plan_id' })
  plan: SubscriptionPlanEntity

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
}
