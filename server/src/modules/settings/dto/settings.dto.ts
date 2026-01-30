import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEmail, IsObject, IsOptional, IsString } from 'class-validator';

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

    @ApiProperty({ required: false })
    @IsObject()
    @IsOptional()
    smtp?: any;

    @ApiProperty({ required: false })
    @IsObject()
    @IsOptional()
    payment?: any;

    @ApiProperty({ required: false })
    @IsOptional()
    navbarLinks?: Array<{
        label: string;
        href: string;
        order: number;
        isOpenInNewTab: boolean;
        isActive: boolean;
    }>;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    footerDescription?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    footerCopyright?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsArray()
    footerSections?: Array<{
        title: string;
        order: number;
        links: Array<{
            label: string;
            href: string;
            order: number;
            isOpenInNewTab: boolean;
            isActive: boolean;
        }>;
    }>;
}
