import { Module } from '@nestjs/common'
import { CacheModule } from './cache/cache.module'
import { PathaoModule } from './courier/pathao/pathao.module'
import { SteadfastModule } from './courier/steadfast/steadfast.module'
import { ExpenseModule } from './expense/expense.module'
import { InventoryTransactionModule } from './inventory-transaction/inventory-transaction.module'
import { InvoiceModule } from './invoice/invoice.module'
import { MailModule } from './mail/mail.module'
import { FileModule } from './media/file.module'
import { PurchaseModule } from './purchase/purchase.module'
import { ReportModule } from './report/report.module'
import { SupplierModule } from './supplier/supplier.module'

@Module({
  imports: [
    FileModule,
    MailModule,
    PathaoModule,
    SteadfastModule,
    CacheModule,
    ReportModule,
    InventoryTransactionModule,
    SupplierModule,
    PurchaseModule,
    InvoiceModule,
    ExpenseModule,
  ],
  exports: [InventoryTransactionModule, SupplierModule, PurchaseModule, InvoiceModule, ExpenseModule],
})
export class OthersModule { }
