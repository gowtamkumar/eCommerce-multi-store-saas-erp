import { IsEnum, IsOptional } from 'class-validator';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class FilterFaqDto extends PaginationDto {
    @IsOptional()
    @IsEnum(['active', 'inactive'])
    status?: string;
}
