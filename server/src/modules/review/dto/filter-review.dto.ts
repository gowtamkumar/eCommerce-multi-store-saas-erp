import { IsEnum, IsOptional } from 'class-validator';
import { ReviewStatus } from '../../../common/enums/review-status.enum';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class FilterReviewDto extends PaginationDto {
    @IsEnum(ReviewStatus)
    @IsOptional()
    status?: ReviewStatus;
}
