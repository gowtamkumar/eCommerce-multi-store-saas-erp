import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator'
import { RFQStatus } from '../entities/rfq.entity'
import { QuotationStatus } from '../entities/quotation.entity'

export class CreateRfqDto {
  @IsString()
  @IsNotEmpty()
  deadlineDate: string

  @IsUUID()
  @IsOptional()
  prId?: string
}

export class UpdateRfqStatusDto {
  @IsEnum(RFQStatus)
  status: RFQStatus
}

export class CreateQuotationDto {
  @IsUUID()
  supplierId: string

  @IsNumber()
  totalAmount: number

  @IsNumber()
  @IsOptional()
  leadTimeDays?: number

  @IsString()
  @IsOptional()
  termsAndConditions?: string
}

export class UpdateQuotationStatusDto {
  @IsEnum(QuotationStatus)
  status: QuotationStatus
}
