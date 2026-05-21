import { BaseEntity } from '@/common/base-entity/BaseEntity'
import { WalletTransactionType } from '@/common/enums/wallet-transaction-type.enum'
import { UserEntity } from '@/modules/admin/core/user/entities/user.entity'
import { TenantEntity } from '@/modules/system/tenant/entities/tenant.entity'
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm'

/**
 * Immutable append-only ledger for customer wallet balances.
 * Pattern mirrors ArLedgerEntity — do not add update/delete behaviour.
 */
@Entity('wallet_ledger')
@Index(['tenantId', 'customerId'])
@Index(['tenantId', 'createdAt'])
export class WalletLedgerEntity extends BaseEntity {
  @Column({ type: 'uuid', name: 'customer_id' })
  customerId: string

  @ManyToOne(() => UserEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'customer_id' })
  customer: UserEntity

  @Column({ type: 'enum', enum: WalletTransactionType })
  type: WalletTransactionType

  /**
   * Signed amount:
   *  - Positive → credit (funds added to wallet)
   *  - Negative → debit (funds spent from wallet)
   */
  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number

  /** Running balance snapshot after this transaction. */
  @Column({ type: 'decimal', precision: 12, scale: 2, name: 'balance_after' })
  balanceAfter: number

  @Column({ type: 'varchar', length: 10, default: 'BDT' })
  currency: string

  /** e.g. 'ORDER_RETURN', 'ORDER', 'POS_SALE', 'MANUAL' */
  @Column({ type: 'varchar', length: 50, name: 'reference_type', nullable: true })
  referenceType: string

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
