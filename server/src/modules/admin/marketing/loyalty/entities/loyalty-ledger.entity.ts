import { BaseEntity } from '@/common/base-entity/BaseEntity'
import { UserEntity } from '@/modules/admin/core/user/entities/user.entity'
import { TenantEntity } from '@/modules/system/tenant/entities/tenant.entity'
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm'
import { LoyaltyTransactionType } from '@/common/enums/loyalty-transaction-type.enum'

@Entity('loyalty_ledger')
@Index(['tenantId', 'customerId'])
@Index(['tenantId', 'createdAt'])
export class LoyaltyLedgerEntity extends BaseEntity {
  @Column({ type: 'uuid', name: 'customer_id' })
  customerId: string

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'customer_id' })
  customer: UserEntity

  @Column({ type: 'enum', enum: LoyaltyTransactionType })
  type: LoyaltyTransactionType

  @Column({ type: 'integer' })
  points: number // Positive for credit, negative for debit (redemption)

  @Column({ type: 'integer', name: 'balance_after' })
  balanceAfter: number // Running balance snapshot

  @Column({ type: 'varchar', length: 50, name: 'reference_type', nullable: true })
  referenceType: string // e.g., 'ORDER', 'REFERRAL', 'MANUAL'

  @Column({ type: 'varchar', length: 255, name: 'reference_id', nullable: true })
  referenceId: string

  @Column({ type: 'text', nullable: true })
  note: string

  @Column({ type: 'uuid', name: 'tenant_id' })
  tenantId: string

  @ManyToOne(() => TenantEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: TenantEntity

  @Column({ type: 'uuid', name: 'created_by', nullable: true })
  createdBy: string
}
