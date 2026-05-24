import { IsDateString, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator'

export class CreateProductBatchDto {
  @IsUUID()
  productId: string

  @IsUUID()
  @IsOptional()
  variantId?: string

  @IsString()
  batchNumber: string

  @IsDateString()
  @IsOptional()
  manufactureDate?: string

  @IsDateString()
  expiryDate: string

  @IsNumber()
  @Min(0)
  initialQuantity: number
}
