import { ApiProperty } from '@nestjs/swagger'
import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator'

export class BrandingSettingsDto {
  @ApiProperty({ required: false, example: 'Powered by OmniCart' })
  @IsString()
  @MaxLength(120)
  @IsOptional()
  footerText?: string

  @ApiProperty({ required: false, example: 'https://example.com/brand-mark.svg' })
  @IsString()
  @MaxLength(500)
  @IsOptional()
  brandMarkUrl?: string

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  showPoweredBy?: boolean
}
