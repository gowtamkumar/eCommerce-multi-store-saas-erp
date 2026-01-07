import {
    IsString,
    IsEmail,
    IsNumber,
    IsEnum,
    IsOptional,
    Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PaymentMethod } from '../../../common/enums/payment-method.enum';

export class CreateOrderDto {
    @ApiProperty()
    @IsString()
    customerName: string;

    @ApiProperty()
    @IsEmail()
    customerEmail: string;

    @ApiProperty()
    @IsString()
    customerPhone: string;

    @ApiProperty()
    @IsString()
    address: string;

    @ApiProperty()
    @IsString()
    productId: string;

    @ApiProperty()
    @IsNumber()
    @Min(1)
    quantity: number;

    @ApiProperty({ enum: PaymentMethod })
    @IsEnum(PaymentMethod)
    paymentMethod: PaymentMethod;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    orderNotes?: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    currency?: string;

    @ApiProperty({ required: false })
    @IsNumber()
    @IsOptional()
    currencyRate?: number;
}
