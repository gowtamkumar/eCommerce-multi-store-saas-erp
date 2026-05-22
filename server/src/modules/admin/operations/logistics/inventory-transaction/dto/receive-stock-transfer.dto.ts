import { IsUUID, IsNumber, IsOptional, IsArray, ValidateNested, Min } from 'class-validator'
import { Type } from 'class-transformer'

export class ReceiveStockTransferLineDto {
  @IsUUID()
  itemId: string

  @IsNumber()
  @Min(0)
  quantityReceived: number
}

export class ReceiveStockTransferDto {
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ReceiveStockTransferLineDto)
  items?: ReceiveStockTransferLineDto[]
}
