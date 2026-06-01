import { IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator'
import { ExpenseCategory } from 'src/common/enums/expense-category.enum'
import {
  ExpenseRecurrence,
  ExpenseStatus,
} from '@/modules/admin/operations/finance/expense/entities/expense.entity'

export class CreateExpenseDto {
  @IsString()
  @IsNotEmpty()
  title: string

  @IsString()
  @IsOptional()
  description?: string

  @IsNumber()
  @IsNotEmpty()
  amount: number

  @IsDateString()
  @IsNotEmpty()
  expenseDate: string

  @IsEnum(ExpenseCategory)
  @IsOptional()
  category?: ExpenseCategory

  @IsString()
  @IsOptional()
  referenceNumber?: string

  @IsString()
  @IsOptional()
  branchId?: string

  @IsString()
  @IsOptional()
  attachmentUrl?: string

  @IsEnum(ExpenseStatus)
  @IsOptional()
  status?: ExpenseStatus

  @IsEnum(ExpenseRecurrence)
  @IsOptional()
  recurrence?: ExpenseRecurrence
}
