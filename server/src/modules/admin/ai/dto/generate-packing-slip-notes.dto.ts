import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional, IsString, MaxLength } from 'class-validator'

export class GeneratePackingSlipNotesDto {
  @ApiProperty({ description: 'Serialized fulfillment task context from admin UI' })
  @IsString()
  @MaxLength(5000)
  fulfillmentSummary: string

  @ApiPropertyOptional({ description: 'Serialized order and shipping context' })
  @IsOptional()
  @IsString()
  @MaxLength(3000)
  orderSummary?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  tone?: string
}

export class PackingSlipNotesResultDto {
  @ApiProperty()
  packingSlipNotes: string

  @ApiProperty()
  handlingNotes: string
}
