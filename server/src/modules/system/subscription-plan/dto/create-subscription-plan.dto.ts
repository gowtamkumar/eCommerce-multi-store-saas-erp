import { IsArray, IsBoolean, IsEnum, IsNumber, IsObject, IsOptional, IsString, Min } from 'class-validator'
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
}
