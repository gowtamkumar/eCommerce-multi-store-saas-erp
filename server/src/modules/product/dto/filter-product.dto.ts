import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { ProductStatus } from '../../../common/enums/product-status.enum';

export class FilterProductDto extends PaginationDto {
    @IsEnum(ProductStatus)
    @IsOptional()
    status?: ProductStatus;

    @IsOptional()
    @IsString()
    categoryId?: string;
    
    @IsOptional()
    @IsString()
    brandId?: string;

    @IsOptional()
    minPrice?: number;

    @IsOptional()
    @IsString()
    sort?: string;
}
