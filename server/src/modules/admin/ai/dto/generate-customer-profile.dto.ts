import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional, IsString, MaxLength } from 'class-validator'

export class GenerateCustomerProfileDto {
  @ApiProperty({ description: 'Serialized customer profile from admin UI' })
  @IsString()
  @MaxLength(4000)
  customerSummary: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(3000)
  ordersSummary?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  returnsSummary?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(1500)
  walletSummary?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(1500)
  loyaltySummary?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  tone?: string
}

export class CustomerProfileResultDto {
  @ApiProperty()
  supportSummary: string

  @ApiProperty({ type: [String] })
  segmentLabels: string[]
}
