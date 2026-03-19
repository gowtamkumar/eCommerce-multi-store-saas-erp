import { IsArray, IsBoolean, IsNumber, IsOptional, IsString } from "class-validator";
import { NavbarLinkDto } from "./navbarLink.dto";

export class FooterSectionDto {
    @IsString()
    @IsOptional()
    title?: string;

    @IsNumber()
    @IsOptional()
    order?: number;

    @IsArray()
    @IsOptional()
    links?: NavbarLinkDto[];
}

export class FooterSettingsDto {
    @IsOptional()
    @IsString()
    template?: string;

    @IsOptional()
    @IsString()
    backgroundColor?: string;

    @IsOptional()
    @IsString()
    textColor?: string;

    @IsOptional()
    @IsString()
    brandColor?: string;

    @IsOptional()
    @IsString()
    borderColor?: string;

    @IsOptional()
    @IsString()
    shadowIntensity?: string;

    @IsOptional()
    @IsString()
    borderRadius?: string;

    @IsOptional()
    @IsString()
    topShape?: string;

    @IsOptional()
    @IsString()
    backgroundPattern?: string;

    @IsOptional()
    @IsBoolean()
    glassEffect?: boolean;

    @IsOptional()
    @IsString()
    columns?: string;

    @IsOptional()
    @IsBoolean()
    showSocialLinks?: boolean;

    @IsOptional()
    @IsBoolean()
    showNewsletter?: boolean;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsString()
    copyright?: string;

    @IsOptional()
    @IsArray()
    sections?: FooterSectionDto[];
}