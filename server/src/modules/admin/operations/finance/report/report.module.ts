import { PageModule } from '@/modules/admin/content/page/page.module'
import { UserModule } from '@/modules/admin/core/user/user.module'
import { ReportRepository } from '@/modules/admin/operations/finance/report/report.repository'
import { ReportController } from '@/modules/admin/operations/finance/report/report.controller'
import { ReportService } from '@/modules/admin/operations/finance/report/report.service'
import { OrderModule } from '@/modules/admin/sales/order/order.module'
import { PaymentModule } from '@/modules/admin/sales/payment/payment.module'
import { SuperAdminModule } from '@/modules/system/super-admin/super-admin.module'
import { Module, forwardRef } from '@nestjs/common'
import { ExpenseModule } from '../expense/expense.module'
import { InvoiceModule } from '../invoice/invoice.module'
import { PurchaseModule } from '../purchase/purchase.module'
import { SupplierModule } from '../supplier/supplier.module'
import { MailModule } from '@/modules/admin/operations/infra/mail/mail.module'
import { SettingsModule } from '@/modules/admin/settings/settings.module'
import { CacheModule } from '@/modules/admin/operations/infra/cache/cache.module'
import { StoreModule } from '@/modules/system/store/store.module'
import { ReportSchedulerService } from './report-scheduler.service'
import { ProductModule } from '@/modules/admin/catalog/product/product.module'

@Module({
  imports: [
    SuperAdminModule,
    UserModule,
    forwardRef(() => ProductModule),
    OrderModule,
    PageModule,
    PaymentModule,
    PurchaseModule,
    SupplierModule,
    ExpenseModule,
    InvoiceModule,
    CacheModule,
    StoreModule,
    MailModule,
    SettingsModule,
  ],
  controllers: [ReportController],
  providers: [ReportService, ReportRepository, ReportSchedulerService],
  exports: [ReportService, ReportRepository, ReportSchedulerService],
})
export class ReportModule { }
