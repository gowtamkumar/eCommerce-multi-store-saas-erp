import { ApiProperty } from '@nestjs/swagger'
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator'
import { FaqStatus } from '@/common/enums/faq-status.enum'

export class CreateFaqDto {
  @ApiProperty()
  @IsString()
  question: string

  @ApiProperty()
  @IsString()
  answer: string

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  category?: string

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  order?: number

  @ApiProperty({ enum: FaqStatus, required: false })
  @IsEnum(FaqStatus)
  @IsOptional()
  status?: FaqStatus

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  productId?: string

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  pageId?: string
}

export class UpdateFaqDto extends CreateFaqDto {}
