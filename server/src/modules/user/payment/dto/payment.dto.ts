import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class InitPaymentDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    orderId: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    callbackUrl?: string;
}
