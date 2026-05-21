# ERP Remaining Implementation Roadmap & Task List

Use this checkable roadmap to track and implement the remaining features needed to complete the ERP platform transformation.

---

## 📅 Phase 1: CRM, B2B Credit & Accounts Receivable (AR) ✅ COMPLETED
**Goal:** Track customer credit debts, enforce B2B limit safety, and generate aging reports.

- [x] **Extend User Profile with B2B Fields:**
  * Added `creditLimit`, `creditHold`, `taxId`, `companyName`, `customerCode`, `preferredBranchId` to `UserEntity`.
- [x] **Implement Accounts Receivable (AR) Ledger:**
  * Created `ar_ledger` table via `ArLedgerEntity` with immutable transaction log.
- [x] **Enforce Credit Limit Checks at Checkout:**
  * Enforced in `OrderService.createOrder` and `PosService.syncPosSale` for `ON_ACCOUNT` payment method.
  * Blocks purchase if outstanding + order > credit limit, or if `creditHold = true`.
- [x] **Build AR Aging Report Engine:**
  * FIFO-based aging in `ArService.getArAgingReport` with Current / 1-30 / 31-60 / 61-90 / 90+ buckets.
- [x] **Finance GL Integration:**
  * Auto-post on credit sales: Debit AR (1200) / Credit Revenue (4000).
  * Auto-post on payments: Debit Cash (1000) / Credit AR (1200).
- [x] **API Endpoints:**
  * `GET /api/v1/finance/ar/aging` — Live aging report.
  * `GET /api/v1/finance/ar/customer/:id` — Customer ledger.
  * `POST /api/v1/finance/ar/payment` — Record debt payment.


---

## 📅 Phase 2: Store Credit & Wallet System ✅ COMPLETED
**Goal:** Manage customer refund balances and support wallet-based checkout.

- [x] **Implement Wallet Ledger Table:**
  * Created `wallet_ledger` table via `WalletLedgerEntity` with fields for transaction type, reference, amount, and running balance.
- [x] **Refund-to-Wallet Workflow:**
  * Refactored returns and refund services to support refunding to customer wallet/store credit ledger.
- [x] **Checkout Deduction Logic:**
  * Added wallet payment checkboxes and checkout validation hooks in POS, Admin, and storefront checkout routes to deduct orders using wallet balance.
- [x] **Finance GL Integration:**
  * Automated journal entries: Debit Refund/Return Liabilities & Credit Customer Wallets (2300-StoreCredit); Debit Store Credit Liabilities & Credit Cash/Sales Revenue (4000) on wallet usage.

---

## 📅 Phase 3: Loyalty & Referrals Engine ✅ COMPLETED
**Goal:** Increase retention via points, tiers, and referral bonuses.

- [x] **Create Loyalty Ledger & Rules:**
  * Create `loyalty_ledger` to log points earned, redeemed, or expired.
  * Create configurations for earning points (e.g. $1 spent = 1 point) and redeeming points (e.g. 100 points = $1).
- [x] **Membership Tier Automation:**
  * Implement job/scheduler to evaluate rolling 12-month customer spending and auto-upgrade or downgrade tiers (`BRONZE`, `SILVER`, `GOLD`, `PLATINUM`).
- [x] **Referrals System:**
  * Generate unique referral codes on user signup.
  * Reward referrer with points or wallet balance after the referee completes their first qualified purchase.

---

## 📅 Phase 4: HRM Payroll Consolidation ✅ COMPLETED
**Goal:** Automate salary runs and connect labor costs to the ledger.

- [x] **Implement Payroll Batch Engine:**
  * Add a service to compile employee monthly salary sheets.
  * Automatically calculate late-attendance deductions, overtime pay, and taxes.
- [x] **Finance GL Integration:**
  * Auto-post salary payments to the General Ledger (Debit Salary Expense / Credit Cash at Bank).
- [x] **Leave Approval Workflows:**
  * Build leave request API with manager approval flow and automatic adjustments to leaf accrual balances.

---

## 📅 Phase 5: Courier SDK Integrations
**Goal:** Connect local logistics systems with third-party shippers.

- [ ] **Complete Steadfast API Integration:**
  * Wire the Steadfast shipping API to create orders, get courier status updates, and download shipping labels automatically.
- [ ] **Complete Pathao SDK Integration:**
  * Wire Pathao merchant API to perform address validation and check pricing rates based on weight and destination.
- [ ] **Webhook Receivers:**
  * Build endpoints to receive delivery notifications and update order shipment statuses automatically.
