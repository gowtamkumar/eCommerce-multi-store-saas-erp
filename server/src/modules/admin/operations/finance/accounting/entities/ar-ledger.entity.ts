import { BaseEntity } from '@/common/base-entity/BaseEntity'
import { Column, Entity, JoinColumn, ManyToOne, Index } from 'typeorm'
import { ArTransactionType } from '@/common/enums/ar-transaction-type.enum'
import { TenantEntity } from '@/modules/system/tenant/entities/tenant.entity'
import { UserEntity } from '@/modules/admin/core/user/entities/user.entity'

@Entity('ar_ledger')
@Index(['tenantId', 'customerId'])
@Index(['tenantId', 'createdAt'])
export class ArLedgerEntity extends BaseEntity {
  @Column({ type: 'uuid', name: 'customer_id' })
  customerId: string

  @ManyToOne(() => UserEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'customer_id' })
  customer: UserEntity

  @Column({
    type: 'enum',
    enum: ArTransactionType,
  })
  type: ArTransactionType

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number // Positive for debt (Invoice), Negative for payments/write-offs

  @Column({ type: 'decimal', precision: 12, scale: 2, name: 'balance_after' })
  balanceAfter: number // Running unpaid AR balance for the customer

  @Column({ type: 'varchar', length: 10, default: 'USD' })
  currency: string

  @Column({ type: 'timestamptz', nullable: true, name: 'due_date' })
  dueDate: Date

  @Column({ type: 'varchar', length: 50, name: 'reference_type', nullable: true })
  referenceType: string // e.g. "ORDER"

  @Column({ type: 'varchar', length: 255, name: 'reference_id', nullable: true })
  referenceId: string

  @Column({ type: 'uuid', name: 'tenant_id' })
  tenantId: string

  @ManyToOne(() => TenantEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: TenantEntity

  @Column({ type: 'uuid', name: 'created_by', nullable: true })
  createdBy: string
}
