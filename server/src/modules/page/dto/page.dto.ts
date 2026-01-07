import { IsString, IsBoolean, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePageDto {
    @ApiProperty()
    @IsString()
    title: string;

    @ApiProperty()
    @IsString()
    slug: string;

    @ApiProperty({ required: false, default: false })
    @IsBoolean()
    @IsOptional()
    isHomePage?: boolean;

    @ApiProperty({ required: false })
    @IsOptional()
    sections?: any;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    metaTitle?: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    metaDescription?: string;

    @ApiProperty({ required: false, default: 'active' })
    @IsString()
    @IsOptional()
    status?: string;
}

export class UpdatePageDto extends CreatePageDto { }
