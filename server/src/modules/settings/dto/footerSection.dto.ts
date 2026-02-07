import { IsArray, IsNumber, IsOptional, IsString } from "class-validator";
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