import { Type } from 'class-transformer'
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator'

export enum PosPaymentMethod {
  CASH = 'CASH',
  CARD = 'CARD',
  MOBILE = 'MOBILE',
  ON_ACCOUNT = 'ON_ACCOUNT',
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

  @IsOptional()
  appliedCoupon?: string

  @IsNumber()
  @IsOptional()
  couponDiscountAmount?: number

  @IsOptional()
  @IsString()
  deliveryZone?: string

  @IsNumber()
  @IsOptional()
  shippingFee?: number

  @IsOptional()
  @IsString()
  shippingAddress?: string

  /** Set to true to deduct from the customer's available wallet balance at checkout. */
  @IsBoolean()
  @IsOptional()
  useWalletBalance?: boolean

  /**
   * Optional: specify an exact wallet deduction amount (partial payment).
   * If omitted but useWalletBalance is true, the full available balance is applied.
   */
  @IsNumber()
  @Min(0.01)
  @IsOptional()
  walletAmountToUse?: number
}

