import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsUUID } from 'class-validator'

export class AddToWishlistDto {
  @IsNotEmpty()
  @IsUUID()
  @ApiProperty({ description: 'The UUID of the product to toggle in wishlist' })
  productId: string
}
