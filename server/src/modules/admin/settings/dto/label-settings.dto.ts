import { ApiProperty } from '@nestjs/swagger'
import { IsOptional, IsString, MaxLength } from 'class-validator'

/**
 * Storefront label overrides. These appear on product cards and checkout
 * pages, so we cap the lengths to defend against layout/UX abuse from
 * pasted-in markdown or scripts.
 */
export class LabelSettingsDto {
  @ApiProperty({ required: false, example: 'New' })
  @IsString()
  @IsOptional()
  @MaxLength(40)
  newArrivalText?: string

  @ApiProperty({ required: false, example: 'Best Seller' })
  @IsString()
  @IsOptional()
  @MaxLength(40)
  bestSellerText?: string
}
