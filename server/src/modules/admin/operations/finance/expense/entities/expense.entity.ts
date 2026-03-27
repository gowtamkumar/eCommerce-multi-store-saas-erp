import { BaseEntity } from '@/common/base-entity/BaseEntity'
import { ExpenseCategory } from '@/common/enums/expense-category.enum'
import { TenantEntity } from '@/modules/system/tenant/entities/tenant.entity'
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm'

import { UserEntity } from '@/modules/admin/core/user/entities/user.entity'
@Entity('expenses')
export class ExpenseEntity extends BaseEntity {
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

  @Column({ type: 'uuid', name: 'tenant_id' })
  tenantId: string

  @ManyToOne(() => TenantEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: TenantEntity

  @Column({ type: 'uuid', name: 'user_id', nullable: true })
  userId: string

  @ManyToOne(() => UserEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity
}
