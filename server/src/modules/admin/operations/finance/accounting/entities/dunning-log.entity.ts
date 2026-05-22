import { TenantEntity } from '@/modules/system/tenant/entities/tenant.entity'
import { UserEntity } from '@/modules/admin/core/user/entities/user.entity'
import { DunningRuleEntity } from './dunning-rule.entity'
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm'

@Entity('dunning_logs')
export class DunningLogEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'uuid', name: 'tenant_id' })
  tenantId: string

  @ManyToOne(() => TenantEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: TenantEntity

  @Column({ type: 'uuid', name: 'customer_id' })
  customerId: string

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'customer_id' })
  customer: UserEntity

  @Column({ type: 'uuid', name: 'dunning_rule_id' })
  dunningRuleId: string

  @ManyToOne(() => DunningRuleEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'dunning_rule_id' })
  dunningRule: DunningRuleEntity

  @Column({ type: 'varchar', name: 'action_taken', length: 50 })
  actionTaken: 'EMAIL' | 'CREDIT_HOLD' | 'EMAIL_AND_HOLD'

  @Column({ type: 'varchar', name: 'recipient_email', length: 255 })
  recipientEmail: string

  @Column({ type: 'varchar', name: 'email_subject', length: 255, nullable: true })
  emailSubject?: string

  @Column({ type: 'text', name: 'email_body', nullable: true })
  emailBody?: string

  @Column({ type: 'integer', name: 'triggered_days_overdue' })
  triggeredDaysOverdue: number

  @Column({ type: 'decimal', name: 'triggered_amount_overdue', precision: 12, scale: 2 })
  triggeredAmountOverdue: number

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date
}
