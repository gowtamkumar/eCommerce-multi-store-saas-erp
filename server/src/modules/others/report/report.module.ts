import { Module } from '@nestjs/common';
import { UserModule } from 'src/modules/admin/user/user.module';
import { OrderModule } from 'src/modules/order/order.module';
import { ReportController } from 'src/modules/others/report/report.controller';
import { PageModule } from 'src/modules/page/page.module';
import { PaymentModule } from 'src/modules/payment/payment.module';
import { ProductModule } from 'src/modules/product/product.module';
import { SuperAdminModule } from 'src/modules/system-platform/super-admin/super-admin.module';

import { PurchaseModule } from '../purchase/purchase.module';
import { SupplierModule } from '../supplier/supplier.module';

@Module({
    imports: [
        SuperAdminModule,
        UserModule,
        ProductModule,
        OrderModule,
        PageModule,
        PaymentModule,
        PurchaseModule,
        SupplierModule,
    ],
    controllers: [ReportController],
})
export class ReportModule { }
