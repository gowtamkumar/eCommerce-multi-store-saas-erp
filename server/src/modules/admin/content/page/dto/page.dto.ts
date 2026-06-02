import {
  IsString,
  IsBoolean,
  IsOptional,
  IsEnum,
  IsInt,
  Min,
  Max,
  MaxLength,
  IsISO8601,
} from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'
import { PageStatus } from '@/common/enums/page-status.enum'

export class CreatePageDto {
  @ApiProperty()
  @IsString()
  @MaxLength(255)
  title: string

  @ApiProperty()
  @IsString()
  @MaxLength(255)
  slug: string

  @ApiProperty({ required: false, default: false })
  @IsBoolean()
  @IsOptional()
  isHomePage?: boolean

  @ApiProperty({ required: false })
  @IsOptional()
  sections?: any

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  metaTitle?: string

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  metaDescription?: string

  @ApiProperty({ required: false })
  @IsOptional()
  typography?: Record<string, unknown>

  @ApiProperty({ required: false, default: PageStatus.PUBLISHED, enum: PageStatus })
  @IsEnum(PageStatus)
  @IsOptional()
  status?: PageStatus

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  ogImage?: string

  @ApiProperty({ required: false, default: 0 })
  @IsInt()
  @Min(0)
  @Max(9999)
  @IsOptional()
  order?: number

  @ApiProperty({ required: false, description: 'ISO timestamp at which to publish the page.' })
  @IsISO8601()
  @IsOptional()
  publishAt?: string | null
}

export class UpdatePageDto extends CreatePageDto {}

export class CreateReusableBlockDto {
  @ApiProperty()
  @IsString()
  @MaxLength(255)
  name: string

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string

  @ApiProperty({ required: false, default: 'block' })
  @IsString()
  @IsOptional()
  category?: string

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  thumbnail?: string

  @ApiProperty()
  payload: any
}

export class UpdateReusableBlockDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  name?: string

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  category?: string

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  thumbnail?: string

  @ApiProperty({ required: false })
  @IsOptional()
  payload?: any
}
