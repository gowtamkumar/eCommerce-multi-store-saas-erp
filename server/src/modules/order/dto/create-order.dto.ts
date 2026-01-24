import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
    IsArray,
    IsEmail,
    IsEnum,
    IsNumber,
    IsOptional,
    IsString,
    Min,
    ValidateNested,
} from 'class-validator';
import { PaymentMethod } from '../../../common/enums/payment-method.enum';

export class OrderItemDto {
    @ApiProperty()
    @IsString()
    productId: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    variantId?: string;

    @ApiProperty()
    @IsNumber()
    @Min(1)
    quantity: number;
}

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

    @ApiProperty({ type: [Object] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => OrderItemDto)
    items: OrderItemDto[];

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
