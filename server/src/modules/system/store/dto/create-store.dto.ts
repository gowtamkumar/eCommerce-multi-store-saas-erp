import { SubscriptionBillingCycle } from '@/common/enums/subscription/billing-cycle.enum'
import {
  IsDefined,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator'

export class CreateStoreDto {
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  storeName: string

  @IsDefined()
  @IsString()
  @IsNotEmpty()
  subdomain: string

  @IsString()
  @IsOptional()
  planId?: string

  @IsEnum(SubscriptionBillingCycle)
  @IsOptional()
  subscriptionBillingCycle?: SubscriptionBillingCycle

  // Admin user details for the new store
  @IsString()
  @IsNotEmpty()
  name: string

  @IsString()
  @IsNotEmpty()
  username: string

  @IsEmail()
  @IsNotEmpty()
  email: string

  @IsString()
  @MinLength(6)
  password: string

  @IsString()
  @IsNotEmpty()
  country: string

  @IsString()
  @IsNotEmpty()
  baseCurrency: string

  @IsString()
  @IsNotEmpty()
  timezone: string

  @IsString()
  @IsOptional()
  accountingStandard?: string
}
