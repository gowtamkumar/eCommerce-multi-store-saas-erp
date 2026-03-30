import { Expose } from 'class-transformer';
import { SubscriptionBillingCycle } from '@/common/enums/subscription/billing-cycle.enum';

export class SubscriptionPlanResponseDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  description: string | null;

  @Expose()
  price: number;
  
  @Expose()
  monthlyPrice: number;

  @Expose()
  yearlyPrice: number;

  @Expose()
  billingCycle: SubscriptionBillingCycle;

  @Expose()
  features: string[];

  @Expose()
  isActive: boolean;

  @Expose()
  isPopular: boolean;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
