import { ShippingZoneType } from '@/common/enums/shipping-zone-type.enum'
import { IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator'

export class CreateShippingAddressDto {
  @IsString()
  @IsNotEmpty()
  recipientName: string

  @IsString()
  @Matches(/^\+?[0-9\s\-]{7,20}$/, { message: 'Phone must be a valid phone number (7 to 20 digits, spaces or hyphens allowed)' })
  phone: string

  @IsString()
  @IsNotEmpty()
  address: string

  @IsString()
  @IsOptional()
  label?: string

  @IsString()
  @IsOptional()
  city?: string

  @IsEnum(ShippingZoneType)
  @IsOptional()
  zone?: ShippingZoneType

  @IsString()
  @IsOptional()
  country?: string

  @IsString()
  @IsOptional()
  state?: string

  @IsString()
  @IsOptional()
  postalCode?: string

  @IsBoolean()
  @IsOptional()
  isDefault?: boolean
}
