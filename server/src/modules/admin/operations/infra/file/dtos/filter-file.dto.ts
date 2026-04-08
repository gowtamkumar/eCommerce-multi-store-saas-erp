import { IsString, IsOptional } from 'class-validator'
import { PaginationDto } from '@/common/dto/pagination.dto'

export class FilterFileDto extends PaginationDto {
  @IsOptional()
  @IsString()
  originalname?: string // Photo, Signature, etc

  @IsOptional()
  @IsString()
  filename?: string
}
