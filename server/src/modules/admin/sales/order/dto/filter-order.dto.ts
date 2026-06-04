import { IsEnum, IsIn, IsOptional, IsString } from 'class-validator'
import { PaginationDto } from '@/common/dto/pagination.dto'
import { OrderStatus } from '@/common/enums/order-status.enum'
import { OrderSource } from '@/common/enums/order-source.enum'

export const ORDER_SORTABLE_FIELDS = [
  'createdAt',
  'totalAmount',
  'status',
  'paymentStatus',
  'customerName',
] as const

export type OrderSortField = (typeof ORDER_SORTABLE_FIELDS)[number]

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

  @IsOptional()
  @IsIn(ORDER_SORTABLE_FIELDS as unknown as string[])
  sortBy?: OrderSortField

  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC'
}
