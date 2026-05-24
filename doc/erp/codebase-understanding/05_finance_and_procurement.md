# Codebase Understanding — Finance & Procurement Modules

This document details the codebase design, entities, services, and transactions for the Chart of Accounts, journal postings, Accounts Receivable (AR) subledgers, Accounts Payable (AP) matching, supplier invoicing, and purchase request approvals.

---

## 1. Finance & General Ledger Domain

Located at: `server/src/modules/admin/operations/finance/accounting/`.

### 1.1 Database Entities
*   **`AccountEntity` (`entities/account.entity.ts`):**
    Chart of Accounts (COA) records. Tracks `accountCode` (e.g. 1010, 2100), `accountName`, `accountType` (ASSET, LIABILITY, EQUITY, REVENUE, EXPENSE), and parent-child hierarchical trees.
*   **`JournalEntryEntity` (`entities/journal-entry.entity.ts`):**
    Double-entry accounting transaction envelope. Stores the transaction timestamp, description, and source event tags (e.g. POS Order ID, Purchase Invoice ID).
*   **`LedgerEntryEntity` (`entities/ledger-entry.entity.ts`):**
    Individual credit or debit lines mapped to specific COA accounts. Validates that debit sum equals credit sum.
*   **`FiscalPeriodEntity` (`entities/fiscal-period.entity.ts`):**
    Protects historical accounting integrity. Restricts updates to locked financial periods.
*   **`ArLedgerEntity` (`entities/ar-ledger.entity.ts`):**
    A B2B customer credit tracking table. Manages credit limits, running balances, and dunning rules.
*   **`DunningRuleEntity` / `DunningLogEntity` (`entities/`):**
    Implements automated debt collections schedules and customer communication logs.
*   **`WalletLedgerEntity` (`entities/wallet-ledger.entity.ts`):**
    Secondary ledger managing customer prepaid wallets and store credits.
*   **`AccountingOutboxEntity` (`entities/accounting-outbox.entity.ts`):**
    Ensures transactional consistency. Publishes journal postings to the queue using the Outbox pattern.

### 1.2 Services & Controllers
*   **`JournalPostingService` (`services/`):**
    The central transaction handler. Converts business events into accounting journals, runs float checks, and commits ledger postings.

---

## 2. Procurement & Supplier Domain

Located at: `server/src/modules/admin/operations/finance/purchase/` and `server/src/modules/admin/operations/finance/supplier/`.

### 2.1 Database Entities
*   **`PurchaseRequisitionEntity` (`entities/purchase-requisition.entity.ts`):**
    Tracks internal employee purchase requests. Requires approval flow before conversion to Purchase Order.
*   **`RfqEntity` (`entities/rfq.entity.ts`):**
    Request for Quotation document sent to multiple suppliers.
*   **`QuotationEntity` (`entities/quotation.entity.ts`):**
    Supplier bid responses containing prices and shipping dates.
*   **`PurchaseOrderEntity` / `PurchaseOrderItemEntity` (`entities/`):**
    Legally binding contract sent to suppliers. Statuses: `DRAFT`, `SENT`, `PARTIAL_RECEIVED`, `CLOSED`.
*   **`SupplierInvoiceEntity` / `SupplierInvoiceItemEntity` (`entities/`):**
    Bill sent by the supplier. Requires 3-way matching validation (checks Supplier Invoice matches both the GRN and the original PO).
*   **`SupplierPaymentEntity` (`entities/supplier-payment.entity.ts`):**
    Tracks cash payouts to supplier ledgers. Releases Accounts Payable balances.
*   **`DebitNoteEntity` (`entities/debit-note.entity.ts`):**
    Initiates return-to-vendor credit requests for rejected items.

### 2.2 Core Services & Rules
*   **`PurchaseService` (`services/purchase.service.ts`):**
    Handles the procure-to-pay lifecycle. Seeds purchase invoices, runs 3-way matching rules, and emits GL entries for AP accounts.
