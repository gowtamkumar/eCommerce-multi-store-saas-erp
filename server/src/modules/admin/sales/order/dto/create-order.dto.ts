import { PaymentMethod } from '@/common/enums/payment-method.enum'
import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import {
  IsArray,
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
  @Matches(/^01\d{9}$/, {
    message: 'Customer phone must be a valid 11-digit Bangladeshi number starting with 01',
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
}
