import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator'
import { DebitNoteStatus } from '../entities/debit-note.entity'

export class CreateDebitNoteDto {
  @IsUUID()
  supplierId: string

  @IsUUID()
  @IsOptional()
  purchaseOrderId?: string

  @IsNumber()
  amount: number

  @IsString()
  @IsOptional()
  reason?: string
}

export class UpdateDebitNoteStatusDto {
  @IsEnum(DebitNoteStatus)
  status: DebitNoteStatus
}
