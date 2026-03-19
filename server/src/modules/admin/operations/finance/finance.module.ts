import { Module } from '@nestjs/common';
import { ExpenseModule } from './expense/expense.module';
import { InvoiceModule } from './invoice/invoice.module';
import { PurchaseModule } from './purchase/purchase.module';
import { ReportModule } from './report/report.module';
import { SupplierModule } from './supplier/supplier.module';

@Module({
  imports: [ExpenseModule, InvoiceModule, PurchaseModule, ReportModule, SupplierModule],
  exports: [ExpenseModule, InvoiceModule, PurchaseModule, ReportModule, SupplierModule],
})
export class FinanceModule {}
