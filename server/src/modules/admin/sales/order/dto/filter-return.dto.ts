import { IsEnum, IsOptional, IsString } from 'class-validator'
import { PaginationDto } from '@/common/dto/pagination.dto'
import { ReturnStatus } from '@/common/enums/return-status.enum'

export class FilterReturnDto extends PaginationDto {
  @IsEnum(ReturnStatus)
  @IsOptional()
  status?: ReturnStatus

  @IsOptional()
  @IsString()
  orderId?: string

  @IsOptional()
  @IsString()
  search?: string
}
