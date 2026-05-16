import { IsArray, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'
import { GrnStatus } from '@/common/enums/grn-status.enum'

export class CreateGrnItemDto {
  @IsUUID()
  @IsNotEmpty()
  productId: string

  @IsUUID()
  @IsOptional()
  variantId?: string

  @IsNumber()
  @Min(0)
  orderedQty: number

  @IsNumber()
  @Min(0)
  receivedQty: number

  @IsNumber()
  @Min(0)
  unitCost: number

  @IsString()
  @IsOptional()
  condition?: string
}

export class CreateGrnDto {
  @IsUUID()
  @IsNotEmpty()
  poId: string

  @IsUUID()
  @IsNotEmpty()
  supplierId: string

  @IsUUID()
  @IsNotEmpty()
  warehouseId: string

  @IsUUID()
  @IsNotEmpty()
  branchId: string

  @IsString()
  @IsOptional()
  notes?: string

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateGrnItemDto)
  items: CreateGrnItemDto[]
}

export class VerifyGrnDto {
  @IsEnum(GrnStatus)
  @IsNotEmpty()
  status: GrnStatus

  @IsString()
  @IsOptional()
  notes?: string
}
