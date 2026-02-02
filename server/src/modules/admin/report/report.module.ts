import { Module } from '@nestjs/common';
import { OrderModule } from '../../order/order.module';
import { PageModule } from '../../page/page.module';
import { PaymentModule } from '../../payment/payment.module';
import { ProductModule } from '../../product/product.module';
import { SuperAdminModule } from '../../super-admin/super-admin.module';
import { ReportController } from './report.controller';

@Module({
    imports: [
        SuperAdminModule,
        ProductModule,
        OrderModule,
        PageModule,
        PaymentModule
    ],
    controllers: [ReportController],
})
export class ReportModule { }
