import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator'
import { PromotionType } from '../enums/promotion-type.enum'
import { PromotionTargetType } from '../enums/promotion-target-type.enum'

export class CreatePromotionDto {
  @IsString()
  name: string

  @IsString()
  @IsOptional()
  slug?: string

  @IsString()
  @IsOptional()
  description?: string

  @IsEnum(PromotionType)
  promotionType: PromotionType

  @IsNumber()
  @Min(0)
  @IsOptional()
  value?: number

  @IsEnum(PromotionTargetType)
  targetType: PromotionTargetType

  @IsUUID()
  @IsOptional()
  targetId?: string

  @IsNumber()
  @Min(0)
  @IsOptional()
  minOrderValue?: number

  @IsDateString()
  @IsOptional()
  startDate?: Date

  @IsDateString()
  @IsOptional()
  endDate?: Date

  @IsBoolean()
  @IsOptional()
  isActive?: boolean
}
