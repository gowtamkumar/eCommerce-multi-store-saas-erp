import { ApiProperty } from '@nestjs/swagger'
import { IsInt, IsNotEmpty, IsOptional, IsUUID, Min } from 'class-validator'

export class CreateCartItemDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsUUID()
  productId: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  variantId?: string

  @ApiProperty()
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  quantity: string // Keep as string if coming from form-data, or number if JSON. Usually number in NestJS DTO but sometimes string in this project based on previous observations. I'll stick to number but handle transformation if needed. Wait, looking at other modules, strict types are preferred.
}
