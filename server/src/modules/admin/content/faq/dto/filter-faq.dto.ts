import { IsEnum, IsOptional } from 'class-validator';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { FaqStatus } from '@/common/enums/faq-status.enum';

export class FilterFaqDto extends PaginationDto {
    @IsOptional()
    @IsEnum(FaqStatus)
    status?: FaqStatus;
}
