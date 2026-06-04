import { IsString, IsOptional } from 'class-validator'
import { PaginationDto } from '@/common/dto/pagination.dto'

export class FilterFileDto extends PaginationDto {
  @IsOptional()
  @IsString()
  originalname?: string // Photo, Signature, etc

  @IsOptional()
  @IsString()
  filename?: string

  // Free-text search (`q`) is inherited from PaginationDto and applied
  // across originalname + filename (partial match) in the service.
}
