import { IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator'
import { ExpenseCategory } from 'src/common/enums/expense-category.enum'

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
}
