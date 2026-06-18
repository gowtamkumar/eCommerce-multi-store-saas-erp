import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsBoolean, IsOptional, IsString, IsUrl, MaxLength } from 'class-validator'

export class GenerateMediaAssistDto {
  @ApiProperty({ description: 'Serialized media file context from admin UI' })
  @IsString()
  @MaxLength(2000)
  mediaSummary: string

  @ApiProperty()
  @IsString()
  @MaxLength(255)
  filename: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  mimetype?: string

  @ApiPropertyOptional({ description: 'Public image URL for optional vision analysis' })
  @IsOptional()
  @IsUrl({ require_tld: false })
  @MaxLength(2000)
  imageUrl?: string

  @ApiPropertyOptional({ description: 'When true and imageUrl is set, attempt vision model analysis' })
  @IsOptional()
  @IsBoolean()
  useVision?: boolean

  @ApiPropertyOptional({ description: 'Where the asset will be used, e.g. product, banner' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  contextHint?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  tone?: string
}

export class MediaAssistResultDto {
  @ApiProperty()
  altText: string

  @ApiProperty()
  suggestedFilename: string

  @ApiPropertyOptional()
  visionUsed?: boolean
}
