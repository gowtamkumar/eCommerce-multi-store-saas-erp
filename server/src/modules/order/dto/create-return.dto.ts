import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
    IsArray,
    IsNumber,
    IsOptional,
    IsString,
    IsUUID,
    Min,
    ValidateNested,
} from 'class-validator';

export class ReturnItemDto {
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

export class CreateReturnDto {
    @ApiProperty()
    @IsUUID()
    orderId: string;

    @ApiProperty()
    @IsString()
    reason: string;

    @ApiProperty({ type: [ReturnItemDto] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ReturnItemDto)
    items: ReturnItemDto[];
}
