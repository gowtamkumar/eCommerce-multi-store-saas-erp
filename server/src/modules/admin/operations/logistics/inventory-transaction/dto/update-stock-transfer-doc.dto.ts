import {
  IsUUID,
  IsNumber,
  IsOptional,
  IsString,
  IsArray,
  ValidateNested,
  Min,
} from 'class-validator'
import { Type } from 'class-transformer'
import { StockTransferLineDto } from './create-stock-transfer-doc.dto'

export class UpdateStockTransferDocDto {
  @IsUUID()
  @IsOptional()
  sourceWarehouseId?: string

  @IsUUID()
  @IsOptional()
  destinationWarehouseId?: string

  @IsString()
  @IsOptional()
  remarks?: string

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => StockTransferLineDto)
  items?: StockTransferLineDto[]
}
