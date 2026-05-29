import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import {
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator'
import { RefundMethod, ReturnType } from '@/common/enums/refund-method.enum'

export class ReturnItemDto {
  @ApiProperty()
  @IsString()
  productId: string

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  variantId?: string

  @ApiProperty()
  @IsNumber()
  @Min(1)
  quantity: number
}

export class CreateReturnDto {
  @ApiProperty()
  @IsUUID()
  orderId: string

  @ApiProperty()
  @IsString()
  reason: string

  @ApiProperty({ type: [ReturnItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReturnItemDto)
  items: ReturnItemDto[]

  /** Whether this is a refund or exchange. Defaults to REFUND. */
  @ApiProperty({ enum: ReturnType, required: false })
  @IsEnum(ReturnType)
  @IsOptional()
  returnType?: ReturnType

  /** Preferred refund method. Defaults to STORE_CREDIT (wallet). */
  @ApiProperty({ enum: RefundMethod, required: false })
  @IsEnum(RefundMethod)
  @IsOptional()
  refundMethod?: RefundMethod
}
