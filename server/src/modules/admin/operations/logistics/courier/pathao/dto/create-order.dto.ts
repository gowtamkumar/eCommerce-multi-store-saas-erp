import { IsOptional, IsString, IsNumber } from 'class-validator'

export class CreatePathaoOrderDto {
  @IsOptional()
  @IsString()
  orderId?: string

  @IsOptional()
  @IsNumber()
  recipient_city?: number

  @IsOptional()
  @IsNumber()
  recipient_zone?: number

  @IsOptional()
  @IsNumber()
  recipient_area?: number

  @IsOptional()
  @IsNumber()
  item_weight?: number
}
