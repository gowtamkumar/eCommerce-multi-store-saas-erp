import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { AiProviderType } from '@/common/types/tenant-ai-config.types'
import {
  IsBoolean,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  Min,
  MaxLength,
  ValidateIf,
} from 'class-validator'

export class UpdateTenantAiConfigDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  enabled?: boolean

  @ApiPropertyOptional({ enum: AiProviderType })
  @IsOptional()
  @IsString()
  provider?: string

  @ApiPropertyOptional({ description: 'Leave blank or send __UNCHANGED__ to keep existing key' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  apiKey?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  baseUrl?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  defaultModel?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  embeddingModel?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  apiVersion?: string

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateIf((o, v) => v !== '' && v != null)
  @IsUrl({ require_tld: false }, { message: 'siteUrl must be a valid URL' })
  siteUrl?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(120)
  siteName?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(8192)
  maxTokens?: number

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(2)
  temperature?: number

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  extraHeaders?: Record<string, string>
}

export class TenantAiConfigResponseDto {
  @ApiProperty()
  enabled: boolean

  @ApiProperty()
  provider: string

  @ApiProperty({ description: 'Whether an API key is stored (value is never returned)' })
  hasApiKey: boolean

  @ApiPropertyOptional({ description: 'Masked preview, e.g. sk-...abcd' })
  apiKeyPreview: string | null

  @ApiPropertyOptional()
  baseUrl?: string

  @ApiPropertyOptional()
  defaultModel?: string

  @ApiPropertyOptional()
  embeddingModel?: string

  @ApiPropertyOptional()
  apiVersion?: string

  @ApiPropertyOptional()
  siteUrl?: string

  @ApiPropertyOptional()
  siteName?: string

  @ApiPropertyOptional()
  maxTokens?: number

  @ApiPropertyOptional()
  temperature?: number

  @ApiPropertyOptional()
  extraHeaders?: Record<string, string>
}

export class TestTenantAiConfigDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  prompt?: string
}
