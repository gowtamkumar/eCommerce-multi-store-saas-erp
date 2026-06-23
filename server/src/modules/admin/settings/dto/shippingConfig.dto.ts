import { IsNumber, IsOptional, IsString } from 'class-validator'

export class ShippingConfigDto {
  @IsNumber()
  @IsOptional()
  insideCityFee?: number

  @IsNumber()
  @IsOptional()
  outsideCityFee?: number

  @IsNumber()
  @IsOptional()
  freeShippingThreshold?: number

  @IsString()
  @IsOptional()
  easyPostApiKey?: string

  @IsString()
  @IsOptional()
  easyPostMode?: string

  @IsString()
  @IsOptional()
  originAddress?: string

  @IsString()
  @IsOptional()
  originCity?: string

  @IsString()
  @IsOptional()
  originState?: string

  @IsString()
  @IsOptional()
  originPostalCode?: string

  @IsString()
  @IsOptional()
  originCountry?: string
}
