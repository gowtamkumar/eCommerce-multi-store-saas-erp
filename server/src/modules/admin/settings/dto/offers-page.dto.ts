import { ApiProperty } from '@nestjs/swagger'
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator'

export class OffersPageSettingsDto {
  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  bannerShow?: boolean

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  bannerHeadline?: string

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  bannerSubheadline?: string

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  showFilters?: boolean

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  productsPerRow?: number

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  bannerHeight?: number

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  bannerFullWidth?: boolean

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  bannerImage?: string

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  bannerBackgroundColor?: string

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  bannerTextColor?: string

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  bannerAlignment?: string

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  bannerOverlayOpacity?: number

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  countdownStyle?: string

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  showCartButton?: boolean

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  showOriginalPrice?: boolean

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  sortBy?: string
}
