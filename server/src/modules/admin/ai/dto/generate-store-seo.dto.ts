import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional, IsString, MaxLength } from 'class-validator'

export class GenerateStoreSeoDto {
  @ApiProperty()
  @IsString()
  @MaxLength(200)
  brandName: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  keywords?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  existingDescription?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  tone?: string
}

export class StoreSeoResultDto {
  @ApiProperty()
  metaTitle: string

  @ApiProperty()
  metaDescription: string
}
