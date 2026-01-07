import { IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus } from '../../../common/enums/order-status.enum';
import { PaymentStatus } from '../../../common/enums/payment-status.enum';

export class UpdateOrderDto {
    @ApiProperty({ enum: OrderStatus, required: false })
    @IsEnum(OrderStatus)
    @IsOptional()
    status?: OrderStatus;

    @ApiProperty({ enum: PaymentStatus, required: false })
    @IsEnum(PaymentStatus)
    @IsOptional()
    paymentStatus?: PaymentStatus;

    @ApiProperty({ required: false })
    @IsOptional()
    transactionId?: string;
}
