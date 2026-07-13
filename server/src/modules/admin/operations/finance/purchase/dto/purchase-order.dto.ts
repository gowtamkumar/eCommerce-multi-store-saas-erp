import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator'
import { Type } from 'class-transformer'
import { PurchaseOrderStatus } from '@/common/enums/purchase-order-status.enum'

export class CreatePurchaseOrderItemDto {
  @IsUUID()
  productId: string

  @Type(() => Number)
  @IsInt({ message: 'Quantity must be a whole number' })
  @Min(1, { message: 'Quantity must be at least 1' })
  quantity: number

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Unit price must be a valid amount' })
  @Min(0, { message: 'Unit price cannot be negative' })
  unitPrice: number

  @IsUUID()
  @IsOptional()
  variantId?: string
}

export class CreatePurchaseOrderDto {
  @IsUUID()
  supplierId: string

  @IsString()
  @IsNotEmpty()
  referenceNumber: string

  @IsArray()
  @ArrayMinSize(1, { message: 'Add at least one purchase line item' })
  @ValidateNested({ each: true })
  @Type(() => CreatePurchaseOrderItemDto)
  items: CreatePurchaseOrderItemDto[]
}

export class UpdatePurchaseOrderStatusDto {
  @IsEnum(PurchaseOrderStatus)
  status: PurchaseOrderStatus

  @IsUUID()
  @IsOptional()
  warehouseId?: string

  @IsUUID()
  @IsOptional()
  branchId?: string
}
