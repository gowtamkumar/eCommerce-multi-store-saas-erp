import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreateWishlistItemDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsUUID()
    productId: string;
}
