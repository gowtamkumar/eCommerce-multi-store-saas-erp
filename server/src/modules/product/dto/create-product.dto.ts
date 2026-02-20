import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
    IsArray,
    IsBoolean,
    IsEnum,
    IsNotEmpty,
    IsNumber,
    IsObject,
    IsOptional,
    IsString,
    IsUUID,
    Min,
    ValidateNested,
} from 'class-validator';
import { ProductStatus } from '../../../common/enums/product-status.enum';

class ProductFaqDto {
    @ApiProperty()
    @IsString()
    question: string;

    @ApiProperty()
    @IsString()
    answer: string;

    @ApiProperty({ required: false })
    @IsNumber()
    @IsOptional()
    order?: number;
}

class ProductAttributeDto {
    @ApiProperty()
    @IsString()
    name: string;

    @ApiProperty()
    @IsArray()
    @IsString({ each: true })
    values: string[];
}

class ProductVariantDto {
    @ApiProperty()
    @IsString()
    sku: string;

    @ApiProperty({ required: false })
    @IsNumber()
    @IsOptional()
    price?: number;

    @ApiProperty()
    @IsNumber()
    @Min(0)
    stock: number;

    @ApiProperty({ required: false })
    @IsArray()
    @IsOptional()
    images?: string[];

    @ApiProperty()
    @IsObject()
    combination: Record<string, string>;
}

export class CreateProductDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    slug: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    description: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    shortDescription?: string;

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
    @IsString({ each: true })
    images: string[];

    @ApiProperty({ required: false })
    @IsBoolean()
    @IsOptional()
    isReview?: boolean;


    @ApiProperty()
    @IsNumber()
    @Min(0)
    stock: number;

    @ApiProperty({ enum: ProductStatus })
    @IsEnum(ProductStatus)
    status: ProductStatus;

    @ApiProperty({ required: false })
    @IsUUID()
    @IsOptional()
    categoryId?: string;

    @ApiProperty({ required: false })
    @IsUUID()
    @IsOptional()
    brandId?: string;

    @ApiProperty({ required: false })
    @IsUUID()
    @IsOptional()
    landingPageId?: string;

    @ApiProperty({ required: false, type: [ProductFaqDto] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ProductFaqDto)
    @IsOptional()
    faqs?: ProductFaqDto[];

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    faqSource?: string;

    @ApiProperty({ required: false })
    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    faqIds?: string[];

    @ApiProperty({ required: false, type: [ProductAttributeDto] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ProductAttributeDto)
    @IsOptional()
    attributes?: ProductAttributeDto[];

    @ApiProperty({ required: false, type: [ProductVariantDto] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ProductVariantDto)
    @IsOptional()
    variants?: ProductVariantDto[];
}
