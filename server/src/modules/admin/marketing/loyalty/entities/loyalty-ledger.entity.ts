import { BaseEntity } from '@/common/base-entity/BaseEntity'
import { UserEntity } from '@/modules/admin/core/user/entities/user.entity'
import { StoreEntity } from '@/modules/system/store/entities/store.entity'
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm'
import { LoyaltyTransactionType } from '@/common/enums/loyalty-transaction-type.enum'

@Entity('loyalty_ledger')
@Index(['storeId', 'customerId'])
@Index(['storeId', 'createdAt'])
// Aging support — point expiry sweeper joins on these
@Index(['storeId', 'expiresAt'])
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

  @Column({ type: 'uuid', name: 'store_id' })
  storeId: string

  @ManyToOne(() => StoreEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'store_id' })
  store: StoreEntity

  @Column({ type: 'uuid', name: 'created_by', nullable: true })
  createdBy: string

  /**
   * When this batch of points expires (NULL = never). Points-expiry sweep
   * inserts a matching negative-points "EXPIRED" entry once `now() > expires_at`
   * and zeroes out any remaining unredeemed balance from this batch.
   */
  @Column({ type: 'timestamp', name: 'expires_at', nullable: true })
  expiresAt: Date | null

  /**
   * Remaining points from this earning that have not yet been redeemed or
   * expired. Only meaningful for positive credit entries; redemptions and
   * expirations record 0. Lets us age points FIFO.
   */
  @Column({ type: 'integer', name: 'remaining_points', default: 0 })
  remainingPoints: number
}
