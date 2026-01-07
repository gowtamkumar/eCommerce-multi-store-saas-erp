import { IsEnum, IsOptional } from 'class-validator';
import { LeadStatus } from '../../../common/enums/lead-status.enum';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class FilterLeadDto extends PaginationDto {
    @IsEnum(LeadStatus)
    @IsOptional()
    status?: LeadStatus;
}
