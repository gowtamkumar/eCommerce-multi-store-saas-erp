# ERP User Manual — Finance & Accounting (Accountant / CFO)

**Document Version:** 1.0.0  
**Audience:** Chartered Accountants, CFOs, Bookkeepers, Finance Officers  
**Last Updated:** May 24, 2026  

---

## Overview
This manual covers the full financial accounting capabilities of the ERP. The system uses **GAAP-compliant double-entry bookkeeping**, meaning every financial transaction is recorded twice — as a Debit in one account and a Credit in another. The sum of all Debits must always equal the sum of all Credits.

> **Financial Immutability Rule:** You can never delete or directly edit a posted journal entry. To correct an error, you must post a **Reversing Journal Entry** that cancels the original, then post the correct entry.

---

## Module 1: Chart of Accounts (COA) Setup

The Chart of Accounts (COA) is the master list of all financial "folders" where money is tracked.

### 1.1 Understanding Account Types

| Account Type | Examples | Normal Balance |
| :--- | :--- | :--- |
| **Asset (1xxx)** | Cash at Bank (1000), Inventory Asset (1100), Accounts Receivable (1200) | Debit |
| **Liability (2xxx)** | Accounts Payable (2000), Store Credit Payable (2300), Tax Payable (2500) | Credit |
| **Equity (3xxx)** | Owner's Capital (3000), Retained Earnings (3100) | Credit |
| **Revenue (4xxx)** | Sales Revenue (4000), Interest Income (4500) | Credit |
| **Expense (5xxx)** | Cost of Goods Sold (5000), Salary Expense (5100), Rent Expense (5200) | Debit |

### 1.2 Viewing the Chart of Accounts
1.  Go to **Finance → Chart of Accounts**
2.  The tree view shows account hierarchy (parent → children)
3.  Click any account to see its running balance and all ledger entries posted to it

### 1.3 Adding a New Account
1.  Go to **Finance → Chart of Accounts → Add Account**
2.  Enter:
    - **Account Code** (e.g., `5300` for `Office Supplies Expense`)
    - **Account Name** (descriptive label)
    - **Account Type** (Asset / Liability / Equity / Revenue / Expense)
    - **Parent Account** (optional, for sub-accounts like `5110 Basic Salary` under `5100 Salary Expense`)
3.  Click **Create Account**

---

## Module 2: Journal Entries (Manual Postings)

### 2.1 Viewing Automatic Journal Entries
Most financial entries are created **automatically** when business events occur:

| Business Event | Auto-Posted Journal Entry |
| :--- | :--- |
| Online order paid | DR Cash (1000) / CR Sales Revenue (4000) |
| Cost of goods sold | DR COGS (5000) / CR Inventory Asset (1100) |
| GRN received from supplier | DR Inventory Asset (1100) / CR Accounts Payable (2000) |
| Supplier payment released | DR Accounts Payable (2000) / CR Cash at Bank (1000) |
| Payroll batch approved | DR Salary Expense (5100) / CR Salary Payable (2200) |
| Salary disbursed | DR Salary Payable (2200) / CR Cash at Bank (1000) |

To view automatic journal entries: **Finance → Journal Entries → Browse All**

### 2.2 Creating a Manual Journal Entry
For adjustments, accruals, or corrections:
1.  Go to **Finance → Journal Entries → New Journal Entry**
2.  Enter **Entry Date** and **Description** (e.g., `Prepaid rent for June 2026`)
3.  Add journal lines:
    - **Line 1:** Select Account → Type: `DEBIT` → Amount: `30,000`
    - **Line 2:** Select Account → Type: `CREDIT` → Amount: `30,000`
4.  Verify the **Balance Indicator** shows `Balanced ✓` (Debit Total = Credit Total)
5.  Click **Post Journal Entry**

> If you see `Unbalanced ✗`, the entry cannot be saved. Check that all debit amounts sum to equal all credit amounts.

### 2.3 Reversing a Journal Entry (Correction)
1.  Find the incorrect entry in **Finance → Journal Entries**
2.  Click **Reverse Entry**
3.  The system creates a mirror-image entry dated today (all Debits become Credits and vice versa)
4.  Then post the correct new entry manually

---

## Module 3: Accounts Payable (AP) — Managing Supplier Debts

### 3.1 The 3-Way Matching Workflow
Before releasing any payment to a supplier, the system performs **3-Way Matching** to verify consistency between:
- **Purchase Order (PO)**: What we ordered and agreed to pay
- **Goods Received Note (GRN)**: What physically arrived and was accepted
- **Supplier Invoice**: What the supplier is billing us

**Steps:**
1.  Go to **Finance → Accounts Payable → Pending Invoices**
2.  Click on a supplier invoice
3.  The system shows the **3-Way Match Result**:
    - ✅ **Matched** — quantities and amounts align across PO, GRN, and Invoice
    - ⚠️ **Partial Match** — some line items have discrepancies (over-delivery or pricing difference)
    - ❌ **Mismatch** — significant discrepancy requiring supplier clarification
4.  For a matched invoice, click **Approve for Payment**

### 3.2 Releasing a Supplier Payment
1.  Go to **Finance → Accounts Payable → Approved Invoices**
2.  Select one or more invoices to pay in a **Batch Payment Run**
3.  Choose the payment bank account (from your COA asset accounts)
4.  Enter the **Payment Date** and **Reference Number** (bank transaction ID)
5.  Click **Release Payment**
6.  The system automatically posts:
    - `DR Accounts Payable (2000)` — reducing the debt
    - `CR Cash at Bank (1000)` — reducing the bank balance

### 3.3 AP Aging Report
The AP Aging Report shows how old your outstanding supplier debts are.
1.  Go to **Finance → Reports → AP Aging**
2.  The report groups debts into:

| Bucket | Description |
| :--- | :--- |
| **Current** | Invoice due within 30 days |
| **1–30 Days Overdue** | 1 to 30 days past due date |
| **31–60 Days Overdue** | 31 to 60 days past due date |
| **61–90 Days Overdue** | 61 to 90 days past due date |
| **90+ Days Overdue** | Severely overdue — escalation required |

---

## Module 4: Accounts Receivable (AR) — Managing Customer Debts

### 4.1 Reviewing B2B Customer Credit Balances
1.  Go to **Finance → Accounts Receivable → Customer Ledger**
2.  Search for the customer by name or customer code
3.  The ledger shows all credit sales (debits — money owed to you) and payments received (credits — money collected)
4.  The **Outstanding Balance** is the total currently owed by this customer

### 4.2 Recording a B2B Customer Payment
When a wholesale customer pays their outstanding balance:
1.  Go to **Finance → Accounts Receivable → Record Payment**
2.  Select the customer
3.  Enter the **Amount Paid**, **Payment Date**, and **Payment Reference** (bank transfer ID)
4.  Select which invoice(s) this payment applies to (partial or full allocation)
5.  Click **Record Payment**
6.  The system posts: `DR Cash (1000)` / `CR Accounts Receivable (1200)`

### 4.3 Setting or Adjusting a Customer Credit Hold
If a customer has consistently delayed payments:
1.  Go to **Customers → [Customer Name] → Credit Settings**
2.  Toggle **Credit Hold = ON**
3.  The customer will be blocked from placing new orders on credit until the hold is lifted

---

## Module 5: VAT & Tax Management

### 5.1 Configuring Tax Rates
1.  Go to **Finance → Tax Engine → Tax Rates**
2.  Click **Add Tax Rate**
3.  Configure:
    - **Name**: e.g., `VAT 15%`
    - **Rate**: e.g., `15.00`
    - **Applicable Categories**: Select which product categories this rate applies to
    - **Region**: Select the region/jurisdiction
4.  Click **Save**

### 5.2 Running the Tax Sandbox Simulator
Before filing, verify your tax calculations using the sandbox:
1.  Go to **Finance → Tax Engine → Simulator**
2.  Enter a sample sale total and select a category
3.  The simulator shows the exact tax breakdown applied — useful for auditing

### 5.3 Generating a Tax Return Summary
1.  Go to **Finance → Tax Engine → Tax Returns**
2.  Select the filing period (e.g., `Q2 2026`)
3.  Click **Generate Summary**
4.  The report shows total taxable sales, total tax collected, and any input tax credits
5.  Export as PDF for submission to the tax authority

---

## Module 6: Financial Reports

### 6.1 Profit & Loss Statement
**Finance → Reports → Profit & Loss**
- Set date range, optionally filter by branch
- Shows: Revenue, COGS, Gross Profit, Operating Expenses, Net Profit

### 6.2 Cash Flow Statement
**Finance → Reports → Cash Flow**
- Shows money flowing in (collections) and out (payments, expenses) categorized by:
  - Operating Activities
  - Investing Activities
  - Financing Activities

### 6.3 Balance Sheet
**Finance → Reports → Finance Summary**
- Snapshot of your business financial position at a point in time:
  - **Assets**: What you own (cash, inventory, receivables)
  - **Liabilities**: What you owe (payables, loans)
  - **Equity**: Net worth (Assets − Liabilities)

### 6.4 Exporting Reports
All reports can be exported via **Finance → Reports → Export**:
- Select report type, date range, and format (CSV / PDF)

---

## Quick Reference Cheatsheet

| Task | Navigation |
| :--- | :--- |
| View Chart of Accounts | Finance → Chart of Accounts |
| Create manual journal entry | Finance → Journal Entries → New Entry |
| Reverse incorrect entry | Finance → Journal Entries → Find Entry → Reverse |
| Approve 3-way matched invoice | Finance → Accounts Payable → Pending Invoices |
| Record supplier payment | Finance → Accounts Payable → Approved Invoices → Release Payment |
| Record B2B customer payment | Finance → Accounts Receivable → Record Payment |
| Put customer on credit hold | Customers → [Customer] → Credit Settings → Credit Hold ON |
| View P&L Report | Finance → Reports → Profit & Loss |
| Generate tax return | Finance → Tax Engine → Tax Returns → Generate Summary |
