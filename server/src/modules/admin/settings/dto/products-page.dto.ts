import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class ProductsPageSettingsDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  bannerHeadline?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  bannerSubheadline?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  bannerTagline?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  bannerImage?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  bannerBackgroundColor?: string;

  @ApiProperty({ required: false })
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  bannerOverlayOpacity?: number;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  bannerTextColor?: string;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  bannerFullWidth?: boolean;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  bannerShow?: boolean;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  bannerStyle?: 'modern' | 'minimal' | 'gradient' | 'image' | 'none';

  @ApiProperty({ required: false })
  @IsNumber()
  @Min(2)
  @Max(6)
  @IsOptional()
  productsPerRow?: number;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  sidebarStyle?: 'classic' | 'modern' | 'minimal';

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  showSearch?: boolean;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  showCategories?: boolean;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  showBrands?: boolean;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  showPriceFilter?: boolean;
}
