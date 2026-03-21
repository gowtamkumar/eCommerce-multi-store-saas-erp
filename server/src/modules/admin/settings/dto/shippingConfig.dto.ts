import { IsNumber, IsOptional } from "class-validator";

export class ShippingConfigDto {
  @IsNumber()
  @IsOptional()
  insideCityFee?: number;

  @IsNumber()
  @IsOptional()
  outsideCityFee?: number;

  @IsNumber()
  @IsOptional()
  freeShippingThreshold?: number;
}
