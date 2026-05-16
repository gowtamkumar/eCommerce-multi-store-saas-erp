import { IsEnum, IsOptional, IsUUID, IsInt, IsArray, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'
import { FulfillmentStatus } from '../enums/fulfillment-status.enum'

export class CreateFulfillmentTaskDto {
  @IsUUID()
  orderId: string

  @IsUUID()
  @IsOptional()
  warehouseId?: string
}

export class UpdateFulfillmentStatusDto {
  @IsEnum(FulfillmentStatus)
  status: FulfillmentStatus
}

export class PickItemDto {
  @IsUUID()
  itemId: string

  @IsInt()
  quantity: number

  @IsUUID()
  @IsOptional()
  binId?: string
}

export class PickItemsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PickItemDto)
  items: PickItemDto[]
}
