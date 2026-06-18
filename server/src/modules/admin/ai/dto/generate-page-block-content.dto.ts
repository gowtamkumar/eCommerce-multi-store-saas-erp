import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator'

export const PAGE_BLOCK_TYPES = ['heading', 'paragraph', 'button', 'text-block'] as const
export type PageBlockType = (typeof PAGE_BLOCK_TYPES)[number]

export class GeneratePageBlockContentDto {
  @ApiProperty({ enum: PAGE_BLOCK_TYPES })
  @IsIn(PAGE_BLOCK_TYPES)
  blockType: PageBlockType

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  pageTitle?: string

  @ApiPropertyOptional({ description: 'What this block should be about' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  topic?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  keywords?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  existingText?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  tone?: string
}

export class PageBlockContentResultDto {
  @ApiPropertyOptional()
  text?: string

  @ApiPropertyOptional()
  headline?: string

  @ApiPropertyOptional()
  subline?: string

  @ApiPropertyOptional()
  html?: string

  @ApiPropertyOptional()
  link?: string
}
