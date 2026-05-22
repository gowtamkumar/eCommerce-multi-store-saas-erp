import { IsUUID, IsNumber, IsOptional, IsString, IsArray, ValidateNested, Min } from 'class-validator'
import { Type } from 'class-transformer'

export class StockTransferLineDto {
  @IsUUID()
  productId: string

  @IsUUID()
  @IsOptional()
  variantId?: string

  @IsNumber()
  @Min(1)
  quantityRequested: number
}

export class CreateStockTransferDocDto {
  @IsUUID()
  sourceWarehouseId: string

  @IsUUID()
  destinationWarehouseId: string

  @IsString()
  @IsOptional()
  remarks?: string

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StockTransferLineDto)
  items: StockTransferLineDto[]
}
