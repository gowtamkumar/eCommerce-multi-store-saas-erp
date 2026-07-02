import { BaseEntity } from '@/common/base-entity/BaseEntity'
import { ExpenseCategory } from '@/common/enums/expense-category.enum'
import { UserEntity } from '@/modules/admin/core/user/entities/user.entity'
import { StoreEntity } from '@/modules/system/store/entities/store.entity'
import { BranchEntity } from '@/modules/system/organization/entities/branch.entity'
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm'

export enum ExpenseStatus {
  DRAFT = 'DRAFT',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  PAID = 'PAID',
}

export enum ExpenseRecurrence {
  NONE = 'NONE',
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  YEARLY = 'YEARLY',
}

/** Composite index for fast store-scoped date-ordered list queries */
@Index(['storeId', 'expenseDate'])
/** Composite index for fast category-filtered queries per store */
@Index(['storeId', 'category'])
@Index(['storeId', 'status'])
@Index(['branchId'])
@Entity('expenses')
export class ExpenseEntity extends BaseEntity {
  @Column({ type: 'uuid', name: 'branch_id', nullable: true })
  branchId: string

  @ManyToOne(() => BranchEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'branch_id' })
  branch: BranchEntity

  @Column({ type: 'varchar', length: 255 })
  title: string

  @Column({ type: 'text', nullable: true })
  description: string

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number

  @Column({ type: 'date', name: 'expense_date' })
  expenseDate: Date

  @Column({
    type: 'enum',
    enum: ExpenseCategory,
    default: ExpenseCategory.OTHER,
  })
  category: ExpenseCategory

  @Column({ type: 'varchar', name: 'reference_number', length: 100, nullable: true })
  referenceNumber: string

  /** URL or storage key for an attached receipt image / PDF (legacy single-file) */
  @Column({ type: 'varchar', name: 'attachment_url', length: 500, nullable: true })
  attachmentUrl: string | null

  /** Multiple receipt/document URLs stored as a JSONB array for richer audit evidence */
  @Column({ type: 'jsonb', name: 'attachments', nullable: true, default: () => "'[]'" })
  attachments: string[]

  /** Approval lifecycle */
  @Column({
    type: 'enum',
    enum: ExpenseStatus,
    default: ExpenseStatus.APPROVED, // Backward-compatible: legacy rows are auto-approved
  })
  status: ExpenseStatus

  @Column({ type: 'uuid', name: 'approved_by_user_id', nullable: true })
  approvedByUserId: string | null

  @Column({ type: 'timestamptz', name: 'approved_at', nullable: true })
  approvedAt: Date | null

  @Column({ type: 'text', name: 'rejection_reason', nullable: true })
  rejectionReason: string | null

  /** Recurring rule. NONE = one-time. */
  @Column({
    type: 'enum',
    enum: ExpenseRecurrence,
    default: ExpenseRecurrence.NONE,
  })
  recurrence: ExpenseRecurrence

  @Column({ type: 'date', name: 'recurrence_next_run', nullable: true })
  recurrenceNextRun: Date | null

  @Column({ type: 'uuid', name: 'parent_recurring_expense_id', nullable: true })
  parentRecurringExpenseId: string | null

  @Column({ type: 'uuid', name: 'store_id' })
  storeId: string

  @ManyToOne(() => StoreEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'store_id' })
  store: StoreEntity

  @ManyToOne(() => UserEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity
}
