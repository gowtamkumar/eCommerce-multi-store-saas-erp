import { ExpenseCategory } from '@/common/enums/expense-category.enum'
import { Expose } from 'class-transformer'

export class ExpenseResponseDto {
  @Expose()
  id: string

  @Expose()
  title: string

  @Expose()
  description: string

  @Expose()
  amount: number

  @Expose()
  expenseDate: Date

  @Expose()
  category: ExpenseCategory

  @Expose()
  referenceNumber: string

  @Expose()
  tenantId: string

  @Expose()
  userId?: string | null

  @Expose()
  createdAt: Date

  @Expose()
  updatedAt: Date
}
