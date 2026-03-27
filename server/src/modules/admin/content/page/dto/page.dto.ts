import { IsString, IsBoolean, IsOptional, IsEnum } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'
import { PageStatus } from '@/common/enums/page-status.enum'

export class CreatePageDto {
  @ApiProperty()
  @IsString()
  title: string

  @ApiProperty()
  @IsString()
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
  metaTitle?: string

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  metaDescription?: string

  @ApiProperty({ required: false })
  @IsOptional()
  typography?: any

  @ApiProperty({ required: false, default: PageStatus.PUBLISHED, enum: PageStatus })
  @IsEnum(PageStatus)
  @IsOptional()
  status?: PageStatus

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  ogImage?: string
}

export class UpdatePageDto extends CreatePageDto {}
