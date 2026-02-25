import { Module } from '@nestjs/common';
import { ReportController } from 'src/modules/admin/report/report.controller';
import { UserModule } from 'src/modules/admin/user/user.module';
import { OrderModule } from 'src/modules/order/order.module';
import { PageModule } from 'src/modules/page/page.module';
import { PaymentModule } from 'src/modules/payment/payment.module';
import { ProductModule } from 'src/modules/product/product.module';
import { SuperAdminModule } from 'src/modules/system-platform/super-admin/super-admin.module';

@Module({
    imports: [
        SuperAdminModule,
        UserModule,
        ProductModule,
        OrderModule,
        PageModule,
        PaymentModule
    ],
    controllers: [ReportController],
})
export class ReportModule { }
