import { Type } from 'class-transformer'
import {
  ArrayNotEmpty,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator'
import { PRStatus } from '../entities/purchase-requisition.entity'

export class CreatePurchaseRequisitionItemDto {
  @IsUUID()
  productId: string

  @IsUUID()
  @IsOptional()
  variantId?: string

  @IsNumber()
  quantity: number

  @IsString()
  @IsOptional()
  notes?: string
}

export class CreatePurchaseRequisitionDto {
  @IsString()
  @IsOptional()
  justification?: string

  @IsString()
  @IsNotEmpty()
  requiredDate: string

  @IsUUID()
  @IsOptional()
  branchId?: string

  @IsUUID()
  @IsOptional()
  warehouseId?: string

  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => CreatePurchaseRequisitionItemDto)
  items: CreatePurchaseRequisitionItemDto[]
}

export class UpdatePurchaseRequisitionStatusDto {
  @IsEnum(PRStatus)
  status: PRStatus

  @IsString()
  @IsOptional()
  rejectionReason?: string
}

export class ConvertPRToPoDto {
  @IsUUID()
  supplierId: string

  @IsString()
  @IsNotEmpty()
  referenceNumber: string
}
