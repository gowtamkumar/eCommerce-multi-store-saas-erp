import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ProductStatus } from '../../../common/enums/product-status.enum';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class FilterProductDto extends PaginationDto {
    @IsEnum(ProductStatus)
    @IsOptional()
    status?: ProductStatus;

    @IsOptional()
    @IsString()
    category?: string;
}
