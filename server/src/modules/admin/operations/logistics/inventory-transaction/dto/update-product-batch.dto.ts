import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator'
import { BatchStatus } from '@/common/enums/batch-status.enum'

export class UpdateProductBatchDto {
  @IsString()
  @IsOptional()
  batchNumber?: string

  @IsDateString()
  @IsOptional()
  manufactureDate?: string

  @IsDateString()
  @IsOptional()
  expiryDate?: string

  @IsEnum(BatchStatus)
  @IsOptional()
  status?: BatchStatus
}
