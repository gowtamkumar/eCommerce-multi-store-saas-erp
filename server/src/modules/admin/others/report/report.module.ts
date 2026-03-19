import { Module } from '@nestjs/common';
import { UserModule } from 'src/modules/admin/core/user/user.module';
import { OrderModule } from 'src/modules/admin/order/order.module';
import { ReportController } from 'src/modules/admin/others/report/report.controller';
import { PageModule } from 'src/modules/admin/page/page.module';
import { PaymentModule } from 'src/modules/user/payment/payment.module';
import { ProductModule } from 'src/modules/admin/product/product.module';
import { SuperAdminModule } from 'src/modules/system/super-admin/super-admin.module';

import { PurchaseModule } from '../purchase/purchase.module';
import { SupplierModule } from '../supplier/supplier.module';
import { ExpenseModule } from '../expense/expense.module';
import { InvoiceModule } from '../invoice/invoice.module';

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
        ExpenseModule,
        InvoiceModule,
    ],
    controllers: [ReportController],
})
export class ReportModule { }
