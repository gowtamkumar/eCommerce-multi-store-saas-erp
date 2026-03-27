import { IsOptional, IsString } from 'class-validator'

export class CreatePathaoOrderDto {
  @IsOptional()
  @IsString()
  orderId?: string

  // @IsNotEmpty()
  // @IsString()
  // recipient_name: string;

  // @IsNotEmpty()
  // @IsString()
  // recipient_phone: string;

  // @IsOptional()
  // @IsString()
  // recipient_secondary_phone?: string;

  // @IsNotEmpty()
  // @IsString()
  // recipient_address: string;

  // @IsOptional()
  // @IsNumber()
  // recipient_city?: number;

  // @IsOptional()
  // @IsNumber()
  // recipient_zone?: number;

  // @IsOptional()
  // @IsNumber()
  // recipient_area?: number;

  // @IsNotEmpty()
  // @IsNumber()
  // delivery_type: number; // 48 for Normal Delivery, 12 for On Demand Delivery

  // @IsNotEmpty()
  // @IsNumber()
  // item_type: number; // 1 for Document, 2 for Parcel

  // @IsOptional()
  // @IsString()
  // special_instruction?: string;

  // @IsNotEmpty()
  // @IsNumber()
  // item_quantity: number;

  // @IsNotEmpty()
  // @IsNumber()
  // @Min(0.5)
  // @Max(10)
  // item_weight: number;

  // @IsOptional()
  // @IsString()
  // item_description?: string;

  // @IsNotEmpty()
  // @IsNumber()
  // amount_to_collect: number;
}
