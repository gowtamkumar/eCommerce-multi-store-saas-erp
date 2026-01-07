import {
    IsString,
    IsNumber,
    IsArray,
    IsOptional,
    IsEnum,
    ValidateNested,
    Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { ProductStatus } from '../../../common/enums/product-status.enum';

class SocialProofDto {
    @ApiProperty()
    @IsString()
    noun: string;

    @ApiProperty()
    @IsNumber()
    count: number;

    @ApiProperty()
    @IsNumber()
    rating: number;

    @ApiProperty()
    @IsArray()
    avatars: string[];
}

class HeroHighlightDto {
    @ApiProperty()
    @IsString()
    icon: string;

    @ApiProperty()
    @IsString()
    label: string;

    @ApiProperty()
    @IsString()
    value: string;

    @ApiProperty()
    @IsString()
    color: string;
}

class SpecificationDto {
    @ApiProperty()
    @IsString()
    label: string;

    @ApiProperty()
    @IsString()
    value: string;
}

class KeyBenefitDto {
    @ApiProperty()
    @IsString()
    icon: string;

    @ApiProperty()
    @IsString()
    title: string;

    @ApiProperty()
    @IsString()
    description: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    color?: string;
}

export class CreateProductDto {
    @ApiProperty()
    @IsString()
    name: string;

    @ApiProperty()
    @IsString()
    slug: string;

    @ApiProperty()
    @IsString()
    description: string;

    @ApiProperty()
    @IsNumber()
    @Min(0)
    price: number;

    @ApiProperty({ required: false })
    @IsNumber()
    @IsOptional()
    @Min(0)
    discountAmount?: number;

    @ApiProperty()
    @IsArray()
    images: string[];

    @ApiProperty()
    @IsArray()
    features: string[];

    @ApiProperty()
    @IsNumber()
    @Min(0)
    stock: number;

    @ApiProperty({ enum: ProductStatus })
    @IsEnum(ProductStatus)
    status: ProductStatus;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    tagline?: string;

    @ApiProperty({ required: false })
    @ValidateNested()
    @Type(() => SocialProofDto)
    @IsOptional()
    socialProof?: SocialProofDto;

    @ApiProperty({ required: false })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => HeroHighlightDto)
    @IsOptional()
    heroHighlights?: HeroHighlightDto[];

    @ApiProperty({ required: false })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => SpecificationDto)
    @IsOptional()
    specifications?: SpecificationDto[];

    @ApiProperty({ required: false })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => KeyBenefitDto)
    @IsOptional()
    keyBenefits?: KeyBenefitDto[];

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    videoUrl?: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    releaseBadgeText?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    sections?: any;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    reviewSectionType?: string;
}
