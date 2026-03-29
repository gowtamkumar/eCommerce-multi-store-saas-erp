import { Expose } from 'class-transformer';
import { PaymentStatus } from '@/common/enums/payment-status.enum';

export class SubscriptionInvoiceResponseDto {
  @Expose()
  id: string;

  @Expose()
  invoiceNumber: string;

  @Expose()
  tenantId: string;

  @Expose()
  subscriptionPlanId: string;

  @Expose()
  amount: number;

  @Expose()
  currency: string;

  @Expose()
  status: PaymentStatus;

  @Expose()
  transactionId: string;

  @Expose()
  billingDate: Date;

  @Expose()
  paymentUrl: string | null;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
