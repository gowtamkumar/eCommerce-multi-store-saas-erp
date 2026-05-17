import { IsEnum, IsOptional, IsString } from 'class-validator'
import { PaginationDto } from '@/common/dto/pagination.dto'
import { OrderStatus } from '@/common/enums/order-status.enum'
import { OrderSource } from '@/common/enums/order-source.enum'

export class FilterOrderDto extends PaginationDto {
  @IsEnum(OrderStatus)
  @IsOptional()
  status?: OrderStatus

  @IsEnum(OrderSource)
  @IsOptional()
  orderSource?: OrderSource

  @IsOptional()
  @IsString()
  paymentStatus?: string

  @IsOptional()
  @IsString()
  search?: string
}
