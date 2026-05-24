# Codebase Understanding — Finance Reporting & Tax Engine

This document details the services that power the financial reporting suite (P&L, Balance Sheet, Cash Flow), the tax computation engine, and the Accounts Receivable (AR) dunning/credit management system.

---

## Module Location

```
server/src/modules/admin/operations/finance/
├── accounting/services/
│   ├── accounting.service.ts          # Core GL journal posting logic (~12KB)
│   ├── accounting-integration.service.ts  # Event listener → accounting side-effects (~7KB)
│   ├── accounting-outbox.service.ts   # Outbox pattern publisher
│   ├── ar.service.ts                  # Accounts Receivable subledger management (~8KB)
│   ├── cogs.service.ts                # Cost of Goods Sold computation
│   ├── dunning.service.ts             # Automated debt collection engine (~8KB)
│   ├── financial-report.service.ts    # P&L, Balance Sheet, Cash Flow (~11KB)
│   ├── tax.service.ts                 # VAT, GST, and multi-rate tax engine (~9KB)
│   └── wallet.service.ts              # Store credit and prepaid wallet ledger (~6KB)
├── report/
│   ├── report.service.ts              # Operational reports (stock, sales, HR) (~28KB)
│   ├── report.repository.ts           # Raw SQL aggregation queries
│   └── report.controller.ts           # Report endpoints with export support
```

---

## 1. Core Accounting Service (`accounting.service.ts`)

The central GL posting engine. Every financial event in the system routes through here.

### Key Methods

| Method | Description |
| :--- | :--- |
| `postJournal(entries[])` | Validate balance, write `JournalEntry` + `LedgerEntry` rows atomically |
| `reverseJournal(journalId)` | Create a mirror-image reversal journal (all debits become credits and vice versa) |
| `getTrialBalance(ctx, period)` | Sum all DR/CR amounts per account for a date range |
| `closeFiscalPeriod(ctx, periodId)` | Lock a period — blocks any further postings to that date range |
| `validateBalance(entries[])` | Internal guard: throws `UnbalancedJournalException` if `ΣDebit ≠ ΣCredit` |

### Posting Rules (Always Enforced)
- Posted journals have status `POSTED` — no `UPDATE` or `DELETE` ever
- Corrections are done via reversal (creating an equal and opposite journal)
- Fiscal period check: if `entryDate` falls in a CLOSED period, posting is rejected

---

## 2. Accounting Integration Service (`accounting-integration.service.ts`)

An event listener service that translates domain events into GL journal entries automatically. This decouples business operations from accounting so each module doesn't need to know accounting rules.

### Event → GL Journal Mappings

| Domain Event | DR Account | CR Account |
| :--- | :--- | :--- |
| `order.paid` (cash sale) | Cash at Counter (1010) | Sales Revenue (4100) |
| `order.paid` (credit sale) | Accounts Receivable (1200) | Sales Revenue (4100) |
| `order.paid` (COGS) | Cost of Goods Sold (5100) | Inventory Asset (1300) |
| `grn.verified` | Inventory Asset (1300) | Accounts Payable (2100) |
| `supplier.payment.released` | Accounts Payable (2100) | Cash at Bank (1020) |
| `order.returned` | Sales Revenue (4100) | Cash / AR (reversal) |
| `payroll.batch.approved` | Salary Expense (6100) | Salary Payable (2200) |
| `payroll.payment.released` | Salary Payable (2200) | Cash at Bank (1020) |
| `expense.created` | Expense Account (6xxx) | Cash / AP (2100) |
| `wallet.credited` | Sales Revenue (4100) | Store Credit Liability (2300) |
| `wallet.redeemed` | Store Credit Liability (2300) | Sales Revenue (4100) |

---

## 3. Tax Engine (`tax.service.ts`)

Manages multi-rate tax computation for both sales and purchases.

### Supported Tax Types
- **VAT (Value Added Tax):** Applied on sales to end customers
- **GST (Goods & Services Tax):** Alternative to VAT in some jurisdictions
- **Input Tax Credit:** VAT paid on purchases (GRN) can offset output tax on sales

### Key Methods
| Method | Description |
| :--- | :--- |
| `computeTax(lineItems[], ruleCode)` | Apply configured tax rate to line items |
| `getTaxLiabilityReport(ctx, period)` | Summarize output tax collected vs input tax paid |
| `generateVatReturn(ctx, period)` | Build the formal VAT return document for filing |

---

## 4. AR & Dunning Services

### `ar.service.ts` — Accounts Receivable
Manages B2B customer credit accounts:
- `postArDebit(customerId, amount)` — Record a new outstanding invoice
- `postArCredit(customerId, amount)` — Record a payment receipt reducing the balance
- `getArStatement(customerId, period)` — Full statement of debits and credits
- `checkCreditLimit(customerId, orderAmount)` — Blocks orders when credit limit is exceeded
- `placeCreditHold(customerId)` — Freezes all future orders for a customer

### `dunning.service.ts` — Automated Debt Collections
Schedules automated AR follow-up based on configurable aging rules:
- `DunningRuleEntity` defines tiers: e.g. "Send email at 7 days overdue, phone call at 30 days, suspend at 60 days"
- `DunningLogEntity` tracks each communication attempt
- Runs as a BullMQ scheduled job (daily cron)

---

## 5. Financial Reporting (`financial-report.service.ts`)

Generates the three standard financial statements:

| Report | Method | How it works |
| :--- | :--- | :--- |
| **Profit & Loss** | `getProfitLoss(ctx, period)` | Sum Revenue accounts (CR) minus Expense accounts (DR) |
| **Balance Sheet** | `getBalanceSheet(ctx, date)` | Assets = Liabilities + Equity as of snapshot date |
| **Cash Flow** | `getCashFlow(ctx, period)` | Aggregate all cash movements from GL by category |
| **Trial Balance** | `getTrialBalance(ctx, period)` | All accounts with DR/CR totals — must net to zero |
| **Aged AP** | `getApAging(ctx)` | Groups supplier outstanding balances into 30/60/90 day buckets |
| **Aged AR** | `getArAging(ctx)` | Groups customer outstanding balances into 30/60/90 day buckets |

---

## 6. Operational Reports (`report.service.ts`)

The large report service (~28KB) handles non-financial operational reporting:

| Report | Description |
| :--- | :--- |
| Sales Summary | Revenue by branch, product, category, date range |
| Inventory Valuation | Stock on hand × average cost per warehouse |
| Stock Movement | Ledger entries filtered by date, type, product |
| Low Stock Alert | Products below `lowStockThreshold` |
| Purchase Summary | PO amounts vs received amounts by supplier |
| Payroll Summary | Gross pay, deductions, net pay per department |
| Attendance Report | Present/absent/late summary per employee/branch |
