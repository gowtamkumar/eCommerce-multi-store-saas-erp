import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsNumber, IsOptional, Max, Min } from 'class-validator'

export class GenerateTenantHealthNarrativeDto {
  @ApiPropertyOptional({ description: 'Lookback window in days for trends', default: 7 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(90)
  days?: number
}

export class TenantHealthAggregateDto {
  @ApiProperty()
  periodDays: number

  @ApiProperty()
  generatedAt: string

  @ApiProperty()
  tenants: {
    total: number
    active: number
    suspended: number
    archived: number
    byPlanTier: Record<string, number>
    bySubscriptionStatus: Record<string, number>
    trialsExpiringWithin7Days: number
    pastDueCount: number
  }

  @ApiProperty()
  billing: {
    mrr: number
    totalRevenue: number
    failedPayments: number
    pendingInvoices: number
    atRiskSubscriptionCount: number
  }

  @ApiProperty()
  engagement: {
    totalUsers: number
    totalOrders: number
    totalProducts: number
    tenantsWithZeroOrders: number
    tenantsWithZeroProducts: number
    lowActivityTenantCount: number
    medianOrdersPerActiveTenant: number
  }

  @ApiProperty()
  trends: {
    tenants?: string | null
    users?: string | null
    orders?: string | null
    traffic?: string | null
  }

  @ApiProperty()
  traffic: {
    requestsInPeriod: number
  }
}

export class TenantHealthNarrativeResultDto {
  @ApiProperty()
  summary: string

  @ApiProperty({ enum: ['low', 'moderate', 'elevated', 'critical'] })
  riskLevel: 'low' | 'moderate' | 'elevated' | 'critical'

  @ApiProperty({ type: [String] })
  keySignals: string[]

  @ApiProperty({ type: [String] })
  recommendedActions: string[]

  @ApiProperty({ type: TenantHealthAggregateDto })
  snapshot: TenantHealthAggregateDto
}
