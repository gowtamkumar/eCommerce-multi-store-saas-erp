import { BaseEntity } from '@/common/base-entity/BaseEntity'
import { WalletTransactionType } from '@/common/enums/wallet-transaction-type.enum'
import { UserEntity } from '@/modules/admin/core/user/entities/user.entity'
import { StoreEntity } from '@/modules/system/store/entities/store.entity'
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm'

/**
 * Immutable append-only ledger for customer wallet balances.
 * Pattern mirrors ArLedgerEntity — do not add update/delete behaviour.
 */
@Entity('wallet_ledger')
@Index(['storeId', 'customerId'])
@Index(['storeId', 'createdAt'])
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

  @Column({ type: 'uuid', name: 'store_id' })
  storeId: string

  @ManyToOne(() => StoreEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'store_id' })
  store: StoreEntity

  @Column({ type: 'uuid', name: 'created_by', nullable: true })
  createdBy: string
}
