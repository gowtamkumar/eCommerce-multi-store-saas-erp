import { IsEnum, IsOptional } from 'class-validator';
import { OrderStatus } from '../../../common/enums/order-status.enum';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class FilterOrderDto extends PaginationDto {
    @IsEnum(OrderStatus)
    @IsOptional()
    status?: OrderStatus;
}
