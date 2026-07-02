import { BaseEntity } from '@/common/base-entity/BaseEntity'
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  Index,
  BeforeUpdate,
  BeforeRemove,
} from 'typeorm'
import { JournalType } from '@/common/enums/journal-type.enum'
import { StoreEntity } from '@/modules/system/store/entities/store.entity'
import { LedgerEntryEntity } from './ledger-entry.entity'

@Entity('journal_entries')
@Index(['storeId', 'date'])
export class JournalEntryEntity extends BaseEntity {
  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  date: Date

  @Column({
    type: 'enum',
    enum: JournalType,
  })
  type: JournalType

  @Column({ type: 'varchar', length: 255 })
  description: string

  @Column({ type: 'varchar', length: 100, nullable: true })
  referenceType: string // e.g. "ORDER", "PURCHASE_ORDER"

  @Column({ type: 'varchar', length: 255, nullable: true })
  referenceId: string

  @Column({ type: 'uuid', name: 'store_id' })
  storeId: string

  @ManyToOne(() => StoreEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'store_id' })
  store: StoreEntity

  @OneToMany(() => LedgerEntryEntity, (ledger) => ledger.journalEntry, { cascade: true })
  lines: LedgerEntryEntity[]

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  totalAmount: number // Sum of debits

  @Column({ type: 'varchar', length: 3, default: 'USD' })
  currency: string

  @Column({ type: 'decimal', precision: 15, scale: 6, default: 1.0, name: 'exchange_rate' })
  exchangeRate: number

  @Column({ type: 'boolean', name: 'is_reversal', default: false })
  isReversal: boolean

  @Column({ type: 'uuid', name: 'reversed_journal_entry_id', nullable: true })
  reversedJournalEntryId: string

  @ManyToOne(() => JournalEntryEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'reversed_journal_entry_id' })
  reversedJournalEntry: JournalEntryEntity

  @BeforeUpdate()
  @BeforeRemove()
  preventChanges() {
    throw new Error('Journal entries are immutable and cannot be updated or deleted.')
  }
}
