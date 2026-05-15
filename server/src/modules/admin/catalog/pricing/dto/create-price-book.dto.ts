import { IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsString, IsDateString } from 'class-validator'
import { PriceBookType } from '../enums/price-book-type.enum'

export class CreatePriceBookDto {
  @IsString()
  @IsNotEmpty()
  name: string

  @IsString()
  @IsNotEmpty()
  code: string

  @IsEnum(PriceBookType)
  @IsOptional()
  type?: PriceBookType

  @IsString()
  @IsOptional()
  currency?: string

  @IsBoolean()
  @IsOptional()
  isActive?: boolean

  @IsDateString()
  @IsOptional()
  validFrom?: Date

  @IsDateString()
  @IsOptional()
  validTo?: Date
}
