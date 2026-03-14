import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class SingleProductPageSettingsDto {
  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  showBreadcrumb?: boolean;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  showRating?: boolean;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  showStock?: boolean;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  showFeatures?: boolean;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  showShare?: boolean;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  showPromotions?: boolean;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  showStickyCart?: boolean;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  showRelatedProducts?: boolean;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  showProductReviews?: boolean;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  showProductFAQs?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  relatedProductsPerRow?: number;
}
