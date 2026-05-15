import { BaseEntity } from '@/common/base-entity/BaseEntity'
import { Column, Entity, JoinColumn, ManyToOne, Index } from 'typeorm'
import { LedgerEntrySide } from '@/common/enums/journal-type.enum'
import { AccountEntity } from './account.entity'
import { JournalEntryEntity } from './journal-entry.entity'
import { TenantEntity } from '@/modules/system/tenant/entities/tenant.entity'

@Entity('ledger_entries')
@Index(['tenantId', 'accountId'])
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

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  balanceAfter: number // Running balance for the specific account

  @Column({ type: 'uuid', name: 'tenant_id' })
  tenantId: string

  @ManyToOne(() => TenantEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: TenantEntity
}
