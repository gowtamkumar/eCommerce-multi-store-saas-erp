import { Module } from '@nestjs/common'
import { ExpenseModule } from './expense/expense.module'
import { InvoiceModule } from './invoice/invoice.module'
import { PurchaseModule } from './purchase/purchase.module'
import { ReportModule } from './report/report.module'
import { SupplierModule } from './supplier/supplier.module'
import { AccountingModule } from './accounting/accounting.module'

@Module({
  imports: [ExpenseModule, InvoiceModule, PurchaseModule, ReportModule, SupplierModule, AccountingModule],
  exports: [ExpenseModule, InvoiceModule, PurchaseModule, ReportModule, SupplierModule, AccountingModule],
})
export class FinanceModule {}
