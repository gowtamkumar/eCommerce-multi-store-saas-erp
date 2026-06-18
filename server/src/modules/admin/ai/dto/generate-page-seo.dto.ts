import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional, IsString, MaxLength } from 'class-validator'

export class GeneratePageSeoDto {
  @ApiProperty()
  @IsString()
  @MaxLength(200)
  pageTitle: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  keywords?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  tone?: string
}

export class PageSeoResultDto {
  @ApiProperty()
  metaTitle: string

  @ApiProperty()
  metaDescription: string
}
