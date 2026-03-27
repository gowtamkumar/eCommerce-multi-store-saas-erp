import { ShippingZoneType } from '@/common/enums/shipping-zone-type.enum';
import { IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';

export class CreateShippingAddressDto {
    @IsString()
    @IsNotEmpty()
    recipientName: string;

    @IsString()
    @Matches(/^01\d{9}$/, { message: 'Phone must be a valid 11-digit BD number starting with 01' })
    phone: string;

    @IsString()
    @IsNotEmpty()
    address: string;

    @IsString()
    @IsOptional()
    label?: string;

    @IsString()
    @IsOptional()
    city?: string;

    @IsEnum(ShippingZoneType)
    @IsOptional()
    zone?: ShippingZoneType;

    @IsBoolean()
    @IsOptional()
    isDefault?: boolean;
}
