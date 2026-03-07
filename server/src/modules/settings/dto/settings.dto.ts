import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsEmail, IsObject, IsOptional, IsString, ValidateNested } from 'class-validator';
import { CurrenciesDto, FooterSectionDto, MarketingDto, NavbarLinkDto, NavbarSettingsDto, PathaoCourierDto, PaymentDto, SmtpDto, SocialLinkDto, SteadfastCourierDto, TrustBadgeDto } from './index';
// import { FooterSectionDto } from './footerSection.dto';
// import { MarketingDto } from './marketing.dto';
// import { NavbarLinkDto } from './navbarLink.dto';
// import { PathaoCourierDto } from './pathaoCourier.dto';
// import { PaymentDto } from './payment.dto';
// import { SmtpDto } from './smtp.dto';
// import { SocialLinkDto } from './socialLink.dto';

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
    @IsArray()
    @IsOptional()
    supportedCurrencies?: CurrenciesDto[];

    @ApiProperty({ required: false })
    @IsObject()
    @IsOptional()
    socialLinks?: SocialLinkDto

    @ApiProperty({ required: false })
    @IsObject()
    @IsOptional()
    marketing?: MarketingDto

    @ApiProperty({ required: false })
    @IsObject()
    @IsOptional()
    smtp?: SmtpDto

    @ApiProperty({ required: false })
    @IsObject()
    @IsOptional()
    payment?: PaymentDto;

    @ApiProperty({ required: false })
    @IsObject()
    @IsOptional()
    pathaoCourier?: PathaoCourierDto;

    @ApiProperty({ required: false })
    @IsObject()
    @IsOptional()
    steadfastCourier?: SteadfastCourierDto;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsObject()
    @ValidateNested()
    @Type(() => NavbarSettingsDto)
    navbar?: NavbarSettingsDto;

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
    footerSections?: FooterSectionDto[]

    @ApiProperty({ required: false })
    @IsOptional()
    @IsArray()
    trustBadges?: TrustBadgeDto[]
}
