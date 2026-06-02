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
import { TenantEntity } from '@/modules/system/tenant/entities/tenant.entity'
import { LedgerEntryEntity } from './ledger-entry.entity'

@Entity('journal_entries')
@Index(['tenantId', 'date'])
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

  @Column({ type: 'uuid', name: 'tenant_id' })
  tenantId: string

  @ManyToOne(() => TenantEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: TenantEntity

  @OneToMany(() => LedgerEntryEntity, (ledger) => ledger.journalEntry, { cascade: true })
  lines: LedgerEntryEntity[]

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  totalAmount: number // Sum of debits

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
