import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { OrderStatus } from '@/common/enums/order-status.enum';

export class FilterOrderDto extends PaginationDto {
    @IsEnum(OrderStatus)
    @IsOptional()
    status?: OrderStatus;

    @IsOptional()
    @IsString()
    search?: string;
}
