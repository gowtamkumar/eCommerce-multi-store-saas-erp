import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { AiProviderType } from '@/common/types/tenant-ai-config.types'
import { Type } from 'class-transformer'
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
  ValidateNested,
} from 'class-validator'

export class UpdateTenantAiStorefrontConfigDto {
  @ApiPropertyOptional({ description: 'Show floating shopping assistant on storefront' })
  @IsOptional()
  @IsBoolean()
  shoppingAssistantEnabled?: boolean

  @ApiPropertyOptional({ description: 'Show “Ask about this product” on product pages' })
  @IsOptional()
  @IsBoolean()
  productQaEnabled?: boolean

  @ApiPropertyOptional({ description: 'Enable hybrid semantic product search' })
  @IsOptional()
  @IsBoolean()
  semanticSearchEnabled?: boolean
}

export class TenantAiStorefrontConfigResponseDto {
  @ApiProperty()
  shoppingAssistantEnabled: boolean

  @ApiProperty()
  productQaEnabled: boolean

  @ApiProperty()
  semanticSearchEnabled: boolean
}

export class UpdateTenantAiAutomationConfigDto {
  @ApiPropertyOptional({ description: 'Queue SEO draft when product is created without meta fields' })
  @IsOptional()
  @IsBoolean()
  productSeoOnCreate?: boolean

  @ApiPropertyOptional({
    description: 'Default-on: queue bulk description job after CSV product import',
  })
  @IsOptional()
  @IsBoolean()
  bulkDescriptionOnImport?: boolean

  @ApiPropertyOptional({ description: 'Draft abandoned cart recovery messages (no auto-send)' })
  @IsOptional()
  @IsBoolean()
  abandonedCartDraft?: boolean

  @ApiPropertyOptional({ description: 'Weekly read-only demand / reorder suggestions' })
  @IsOptional()
  @IsBoolean()
  demandForecastEnabled?: boolean
}

export class TenantAiAutomationConfigResponseDto {
  @ApiProperty()
  productSeoOnCreate: boolean

  @ApiProperty()
  bulkDescriptionOnImport: boolean

  @ApiProperty()
  abandonedCartDraft: boolean

  @ApiProperty()
  demandForecastEnabled: boolean
}

export class UpdateTenantAiSensitiveConfigDto {
  @ApiPropertyOptional({
    description: 'Allow AI features for HRM module (leave, recruitment, payroll, performance). Disable to opt this tenant out of HR data being sent to the AI provider.',
  })
  @IsOptional()
  @IsBoolean()
  hrmEnabled?: boolean

  @ApiPropertyOptional({
    description: 'Allow AI features for Finance module (AR, AP, tax, expense, ledger). Disable to opt this tenant out of financial data being sent to the AI provider.',
  })
  @IsOptional()
  @IsBoolean()
  financeEnabled?: boolean
}

export class TenantAiSensitiveConfigResponseDto {
  @ApiProperty({ description: 'AI enabled for HRM module' })
  hrmEnabled: boolean

  @ApiProperty({ description: 'AI enabled for Finance module' })
  financeEnabled: boolean
}

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

  @ApiPropertyOptional({ type: UpdateTenantAiStorefrontConfigDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateTenantAiStorefrontConfigDto)
  storefront?: UpdateTenantAiStorefrontConfigDto

  @ApiPropertyOptional({ type: UpdateTenantAiAutomationConfigDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateTenantAiAutomationConfigDto)
  automation?: UpdateTenantAiAutomationConfigDto

  @ApiPropertyOptional({
    type: UpdateTenantAiSensitiveConfigDto,
    description: 'Per-module AI opt-out for sensitive data modules (HRM, Finance)',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateTenantAiSensitiveConfigDto)
  sensitive?: UpdateTenantAiSensitiveConfigDto
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

  @ApiProperty({ type: TenantAiStorefrontConfigResponseDto })
  storefront: TenantAiStorefrontConfigResponseDto

  @ApiProperty({ type: TenantAiAutomationConfigResponseDto })
  automation: TenantAiAutomationConfigResponseDto

  @ApiProperty({ type: TenantAiSensitiveConfigResponseDto, description: 'Per-module AI opt-out toggles' })
  sensitive: TenantAiSensitiveConfigResponseDto
}

export class TestTenantAiConfigDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  prompt?: string
}
