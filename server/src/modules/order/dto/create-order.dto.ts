import { ApiProperty } from '@nestjs/swagger';
import {
    IsEmail,
    IsEnum,
    IsNumber,
    IsOptional,
    IsString,
    Min
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

    // @ApiProperty({ type: [Object], required: false })
    // @IsArray()
    // @ValidateNested({ each: true })
    // @Type(() => OrderItemDto)
    // @IsOptional()
    // items?: OrderItemDto[];

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
