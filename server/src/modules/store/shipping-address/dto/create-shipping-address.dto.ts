import { IsBoolean, IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';

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

    @IsString()
    @IsOptional()
    zone?: string;

    @IsBoolean()
    @IsOptional()
    isDefault?: boolean;
}
