import { OrderEntity } from '@/modules/admin/sales/order/entities/order.entity';
import { SiteSettingsEntity } from '@/modules/admin/settings/entities/site-settings.entity';
import { PaymentInitiationResult, PaymentStrategy, PaymentStrategyOptions, PaymentCallbackResult } from './payment-strategy.interface';

export class CodPaymentStrategy implements PaymentStrategy {
    async initiate(order: OrderEntity, settings: SiteSettingsEntity, options: PaymentStrategyOptions): Promise<PaymentInitiationResult> {
        return {
            success: true,
            message: 'Order created with Cash on Delivery'
        };
    }

    async validateCallback(response: any, query?: any): Promise<PaymentCallbackResult> {
        return {
            success: true,
            transactionId: response.tran_id || query?.tran_id,
            gatewayResponse: response,
            methodName: 'COD'
        };
    }

    getRedirectUrl(response: any, appUrl: string): string {
        return `${appUrl}/payment/success?tran_id=${response.tran_id}`;
    }
}
