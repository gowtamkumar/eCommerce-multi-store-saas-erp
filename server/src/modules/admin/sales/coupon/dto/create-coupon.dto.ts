import { DiscountType } from '@/common/enums/discount-type.enum'
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator'

export class CreateCouponDto {
  @IsString()
  code: string

  @IsString()
  @IsOptional()
  description?: string

  @IsEnum(DiscountType)
  discountType: DiscountType

  @IsNumber()
  @Min(0)
  amount: number

  @IsNumber()
  @Min(0)
  @IsOptional()
  minPurchaseAmount?: number

  @IsDateString()
  @IsOptional()
  startDate?: Date

  @IsDateString()
  @IsOptional()
  expiryDate?: Date

  @IsNumber()
  @Min(1)
  @IsOptional()
  usageLimit?: number

  @IsBoolean()
  @IsOptional()
  isActive?: boolean
}
