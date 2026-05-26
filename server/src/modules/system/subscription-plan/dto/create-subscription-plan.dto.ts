import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Min,
} from 'class-validator'
import { SubscriptionBillingCycle } from '@/common/enums/subscription/billing-cycle.enum'

export class CreateSubscriptionPlanDto {
  @IsString()
  name: string

  @IsString()
  @IsOptional()
  description?: string

  @IsNumber()
  @Min(0)
  price: number

  @IsNumber()
  @Min(0)
  @IsOptional()
  monthlyPrice?: number

  @IsNumber()
  @Min(0)
  @IsOptional()
  yearlyPrice?: number

  @IsEnum(SubscriptionBillingCycle)
  @IsOptional()
  billingCycle?: SubscriptionBillingCycle

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  features?: string[]

  @IsBoolean()
  @IsOptional()
  isActive?: boolean

  @IsBoolean()
  @IsOptional()
  isPopular?: boolean

  @IsInt()
  @Min(0)
  @IsOptional()
  trialPeriodDays?: number

  @IsString()
  @IsOptional()
  code?: string

  @IsString()
  @IsOptional()
  currency?: string

  @IsInt()
  @Min(-1)
  @IsOptional()
  maxBranches?: number

  @IsInt()
  @Min(-1)
  @IsOptional()
  maxWarehouses?: number

  @IsInt()
  @Min(-1)
  @IsOptional()
  maxStaffUsers?: number

  @IsInt()
  @Min(-1)
  @IsOptional()
  maxProducts?: number

  @IsInt()
  @Min(-1)
  @IsOptional()
  maxMonthlyOrders?: number

  @IsInt()
  @Min(-1)
  @IsOptional()
  maxStorageMb?: number

  @IsString()
  @IsOptional()
  stripePriceIdMonthly?: string

  @IsString()
  @IsOptional()
  stripePriceIdYearly?: string
}
