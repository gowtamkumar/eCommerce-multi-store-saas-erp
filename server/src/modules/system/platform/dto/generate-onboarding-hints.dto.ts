import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional, IsString, MaxLength } from 'class-validator'

export class GenerateOnboardingHintsDto {
  @ApiProperty()
  @IsString()
  @MaxLength(200)
  storeName: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(120)
  subdomain?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(120)
  planName?: string

  @ApiPropertyOptional({ description: 'Comma-separated enabled modules or feature slugs' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  enabledFeatures?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  merchantProfile?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  tone?: string
}

export class OnboardingHintsResultDto {
  @ApiProperty()
  welcomeSummary: string

  @ApiProperty({ type: [String] })
  setupChecklist: string[]

  @ApiProperty({ type: [String] })
  firstWeekTips: string[]

  @ApiProperty()
  supportResourcesHint: string
}
