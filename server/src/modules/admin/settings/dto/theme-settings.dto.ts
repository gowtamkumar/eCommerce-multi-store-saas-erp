import { ApiProperty } from '@nestjs/swagger'
import { IsHexColor, IsIn, IsOptional, IsString, MaxLength } from 'class-validator'

export class ThemeSettingsDto {
  @ApiProperty({ required: false, enum: ['system', 'light', 'dark'] })
  @IsIn(['system', 'light', 'dark'])
  @IsOptional()
  mode?: 'system' | 'light' | 'dark'

  @ApiProperty({ required: false, example: '#2563eb' })
  @IsHexColor()
  @IsOptional()
  primaryColor?: string

  @ApiProperty({ required: false, example: '#0f172a' })
  @IsHexColor()
  @IsOptional()
  accentColor?: string

  @ApiProperty({ required: false, example: 'Inter' })
  @IsString()
  @MaxLength(80)
  @IsOptional()
  fontFamily?: string
}
