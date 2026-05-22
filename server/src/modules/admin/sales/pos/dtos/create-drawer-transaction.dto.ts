import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator'
import { PosDrawerTransactionType } from '../entities/pos-drawer-transaction.entity'

export class CreateDrawerTransactionDto {
  @IsEnum(PosDrawerTransactionType)
  @IsNotEmpty()
  type: PosDrawerTransactionType

  @IsNumber()
  @Min(0.01)
  @IsNotEmpty()
  amount: number

  @IsString()
  @IsOptional()
  reason?: string
}
