import { BaseEntity } from '@/common/base-entity/BaseEntity'
import { Column, Entity, JoinColumn, ManyToOne, Index, BeforeUpdate, BeforeRemove } from 'typeorm'
import { LedgerEntrySide } from '@/common/enums/journal-type.enum'
import { AccountEntity } from './account.entity'
import { JournalEntryEntity } from './journal-entry.entity'
import { StoreEntity } from '@/modules/system/store/entities/store.entity'

@Entity('ledger_entries')
@Index(['storeId', 'accountId'])
export class LedgerEntryEntity extends BaseEntity {
  @ManyToOne(() => JournalEntryEntity, (journal) => journal.lines, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'journal_entry_id' })
  journalEntry: JournalEntryEntity

  @Column({ type: 'uuid', name: 'journal_entry_id' })
  journalEntryId: string

  @ManyToOne(() => AccountEntity)
  @JoinColumn({ name: 'account_id' })
  account: AccountEntity

  @Column({ type: 'uuid', name: 'account_id' })
  accountId: string

  @Column({
    type: 'enum',
    enum: LedgerEntrySide,
  })
  side: LedgerEntrySide

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number

  @Column({ type: 'varchar', length: 3, default: 'USD', name: 'transaction_currency' })
  transactionCurrency: string

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0, name: 'transaction_amount' })
  transactionAmount: number

  @Column({ type: 'decimal', precision: 15, scale: 6, default: 1.0, name: 'exchange_rate' })
  exchangeRate: number

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  balanceAfter: number // Running balance for the specific account

  @Column({ type: 'uuid', name: 'store_id' })
  storeId: string

  @ManyToOne(() => StoreEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'store_id' })
  store: StoreEntity

  @BeforeUpdate()
  @BeforeRemove()
  preventChanges() {
    throw new Error('Ledger entries are immutable and cannot be updated or deleted.')
  }
}
