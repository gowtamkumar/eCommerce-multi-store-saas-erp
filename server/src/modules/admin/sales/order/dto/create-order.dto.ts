import { PaymentMethod } from '@/common/enums/payment-method.enum'
import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import {
  IsArray,
  IsBoolean,
  IsDefined,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  Min,
  ValidateNested,
} from 'class-validator'

export class OrderItemDto {
  @ApiProperty()
  @IsString()
  productId: string

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  variantId?: string

  @ApiProperty()
  @IsNumber()
  @Min(1)
  quantity: number
}

export class CreateOrderDto {
  @IsOptional()
  @IsUUID()
  @IsString()
  userId: string

  @IsDefined()
  @IsNotEmpty()
  @IsString()
  customerName: string

  @IsOptional()
  @IsEmail()
  customerEmail: string

  @IsString()
  @Matches(/^\+?[0-9\s\-]{7,20}$/, {
    message: 'Customer phone must be a valid phone number (7 to 20 digits, spaces or hyphens allowed)',
  })
  customerPhone: string

  @IsString()
  address: string

  @ApiProperty({ type: [OrderItemDto], required: false })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  @IsOptional()
  items?: OrderItemDto[]

  @ApiProperty({ enum: PaymentMethod })
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  orderNotes?: string

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  currency?: string

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  currencyRate?: number

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  appliedCouponCode?: string

  /** Optional: specify which Price Book to use for pricing resolution (e.g. 'WHOLESALE', 'EID-2026'). */
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  priceBookCode?: string

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  shippingZone?: string

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  shippingFee?: number

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  courierId?: string

  @ApiProperty({ required: false })
  @IsUUID()
  @IsOptional()
  shippingAddressId?: string

  /** Set to true to deduct from the customer's available wallet balance at checkout. */
  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  useWalletBalance?: boolean

  /**
   * Optional: specify an exact amount to deduct from wallet (partial payment).
   * If omitted but useWalletBalance is true, the max available balance is deducted.
   */
  @ApiProperty({ required: false })
  @IsNumber()
  @Min(0.01)
  @IsOptional()
  walletAmountToUse?: number
}
