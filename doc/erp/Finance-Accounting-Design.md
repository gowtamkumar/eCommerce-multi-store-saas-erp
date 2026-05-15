# Finance & Accounting System Design

This document outlines the design for the Finance and Accounting domain, which serves as the "Financial Source of Truth" for the entire ERP system.

---

## 1. Accounting Philosophy
The accounting module must adhere to standard financial principles:
- **Double-Entry Bookkeeping**: Every transaction must have a balanced Debit and Credit.
- **Financial Immutability**: Once a journal entry is posted, it cannot be deleted or edited. Corrections must be made via **Reversal Entries**.
- **Event-Driven**: Accounting entries are generated automatically by business events (e.g., Sale completed, Stock received).
- **Multi-Tenant & Multi-Branch**: Financial reports can be consolidated or filtered by branch.

---

## 2. Core Entities (Database Design)

### 2.1 Chart of Accounts (COA)
The master list of accounts used to categorize every transaction.
- `id`: UUID
- `code`: string (e.g., `1010`, `4000`)
- `name`: string (e.g., "Cash at Bank", "Sales Revenue")
- `type`: enum (ASSET, LIABILITY, EQUITY, REVENUE, EXPENSE)
- `category`: string (e.g., "Current Assets", "Operating Expenses")
- `parentAccountId`: UUID (For hierarchical accounts)
- `isSystemAccount`: boolean (Protected accounts like AR/AP that cannot be deleted)
- `status`: enum (ACTIVE, INACTIVE)

### 2.2 Journal Entry (Header)
The record of a business transaction.
- `id`: UUID
- `entryDate`: date
- `referenceNumber`: string (e.g., `INV-1001`, `PO-500`)
- `description`: text
- `sourceModule`: enum (SALES, PROCUREMENT, PAYROLL, INVENTORY, MANUAL)
- `status`: enum (DRAFT, POSTED, REVERSED)
- `createdBy`: UUID

### 2.3 Journal Entry Line (Ledger)
The individual debit/credit lines.
- `id`: UUID
- `journalEntryId`: UUID
- `accountId`: UUID (Link to COA)
- `debit`: decimal
- `credit`: decimal
- `branchId`: UUID (For branch-specific reporting)
- `notes`: string

### 2.4 Tax Configuration
Regional tax rules.
- `id`: UUID
- `name`: string (e.g., "Standard VAT 15%")
- `rate`: decimal (e.g., 15.00)
- `type`: enum (PERCENTAGE, FIXED)
- `collectedAccountId`: UUID (COA link for Tax Liability)
- `paidAccountId`: UUID (COA link for Tax Input/Asset)

---

## 3. Integration & Automated Entries

Accounting should not be manual. It should react to **Business Events**.

### 3.1 Sales Event (Order Paid)
When a POS or Online order is marked as PAID:
- **Debit**: Cash or Bank Account.
- **Credit**: Sales Revenue Account.
- **Credit**: Tax Liability Account (VAT).
- **Debit**: Cost of Goods Sold (COGS).
- **Credit**: Inventory Asset (based on stock valuation).

### 3.2 Procurement Event (Goods Received)
When a GRN is confirmed:
- **Debit**: Inventory Asset.
- **Credit**: Accounts Payable (Supplier).

### 3.3 Expense Event
When a utility bill or rent is recorded:
- **Debit**: Expense Account (e.g., Rent Expense).
- **Credit**: Cash or Bank Account.

---

## 4. Financial Reporting

### 4.1 Profit & Loss (Income Statement)
Calculates net profit over a period:
`Revenue - COGS = Gross Profit`
`Gross Profit - Operating Expenses = Net Profit`

### 4.2 Balance Sheet
A snapshot of the business's health at a specific point in time:
`Assets = Liabilities + Equity`

### 4.3 Accounts Receivable (AR) & Payable (AP)
- **AR Aging**: Tracks customers who owe money and for how long.
- **AP Aging**: Tracks suppliers the company owes money to.

---

## 5. Tax & Compliance
- **Tax Reports**: Automated generation of tax collected vs. tax paid for regional filings.
- **Audit Trail**: Every change to the financial ledger records the user, timestamp, and IP address.
- **Fiscal Year Closing**: Workflow to lock the previous year's entries and carry over balances.

---

## 6. Petty Cash Management
- Dedicated sub-ledger for small, daily cash expenses managed at the **Branch** level.
- Requires periodic "Replenishment" workflows with manager approval.
