import { Type } from 'class-transformer'
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator'

export enum PosPaymentMethod {
  CASH = 'CASH',
  CARD = 'CARD',
  MOBILE = 'MOBILE',
}

export class PosSaleItemDto {
  @IsUUID()
  @IsNotEmpty()
  productId: string

  @IsUUID()
  @IsOptional()
  variantId?: string

  @IsNumber()
  @Min(1)
  @IsNotEmpty()
  quantity: number

  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  price: number
}

export class SyncPosSaleDto {
  @IsUUID()
  @IsNotEmpty()
  shiftId: string

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PosSaleItemDto)
  items: PosSaleItemDto[]

  @IsEnum(PosPaymentMethod)
  @IsNotEmpty()
  paymentMethod: PosPaymentMethod

  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  paymentAmount: number

  @IsUUID()
  @IsOptional()
  customerId?: string

  @IsOptional()
  createdAt?: string // ISO string representing offline transaction timestamp
}
