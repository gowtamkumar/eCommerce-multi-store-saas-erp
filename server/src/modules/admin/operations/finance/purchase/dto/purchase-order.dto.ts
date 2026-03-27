import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator'
import { Type } from 'class-transformer'
import { PurchaseOrderStatus } from '@/common/enums/purchase-order-status.enum'

export class CreatePurchaseOrderItemDto {
  @IsUUID()
  productId: string

  @IsNumber()
  quantity: number

  @IsNumber()
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
  @ValidateNested({ each: true })
  @Type(() => CreatePurchaseOrderItemDto)
  items: CreatePurchaseOrderItemDto[]
}

export class UpdatePurchaseOrderStatusDto {
  @IsEnum(PurchaseOrderStatus)
  status: PurchaseOrderStatus
}
