import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class InitPaymentDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    orderId: string;
}
