import { Module } from '@nestjs/common';
import { UserModule } from '@/modules/admin/core/user/user.module';
import { OrderModule } from '@/modules/admin/sales/order/order.module';
import { ReportController } from '@/modules/admin/operations/finance/report/report.controller';
import { PageModule } from '@/modules/admin/content/page/page.module';
import { PaymentModule } from '@/modules/user/payment/payment.module';
import { ProductModule } from '@/modules/admin/catalog/product/product.module';
import { SuperAdminModule } from '@/modules/system/super-admin/super-admin.module';
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
