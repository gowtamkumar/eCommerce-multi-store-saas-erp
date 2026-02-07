import { IsBoolean, IsNumber, IsOptional, IsString } from "class-validator";

export class NavbarLinkDto {
    @IsString()
    @IsOptional()
    label?: string;

    @IsString()
    @IsOptional()
    href?: string;

    @IsNumber()
    @IsOptional()
    order?: number;

    @IsBoolean()
    @IsOptional()
    isOpenInNewTab?: boolean;

    @IsBoolean()
    @IsOptional()
    isActive?: boolean;
}