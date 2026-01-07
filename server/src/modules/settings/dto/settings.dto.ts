import { IsString, IsEmail, IsOptional, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateSiteSettingsDto {
    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    logo?: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    brandName?: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    siteDescription?: string;

    @ApiProperty({ required: false })
    @IsEmail()
    @IsOptional()
    contactEmail?: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    contactPhone?: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    whatsappPhone?: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    address?: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    currency?: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    currencySymbol?: string;

    @ApiProperty({ required: false })
    @IsObject()
    @IsOptional()
    socialLinks?: any;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    productMode?: string;

    @ApiProperty({ required: false })
    @IsObject()
    @IsOptional()
    marketing?: any;
}
