import { ProductModule } from '@/modules/admin/catalog/product/product.module'
import { PageModule } from '@/modules/admin/content/page/page.module'
import { UserModule } from '@/modules/admin/core/user/user.module'
import { ReportRepository } from '@/modules/admin/operations/finance/report/report.repository'
import { ReportController } from '@/modules/admin/operations/finance/report/report.controller'
import { ReportService } from '@/modules/admin/operations/finance/report/report.service'
import { OrderModule } from '@/modules/admin/sales/order/order.module'
import { PaymentModule } from '@/modules/admin/sales/payment/payment.module'
import { SuperAdminModule } from '@/modules/system/super-admin/super-admin.module'
import { Module } from '@nestjs/common'
import { ExpenseModule } from '../expense/expense.module'
import { InvoiceModule } from '../invoice/invoice.module'
import { PurchaseModule } from '../purchase/purchase.module'
import { SupplierModule } from '../supplier/supplier.module'

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
  providers: [ReportService, ReportRepository],
  exports: [ReportService, ReportRepository],
})
export class ReportModule {}
