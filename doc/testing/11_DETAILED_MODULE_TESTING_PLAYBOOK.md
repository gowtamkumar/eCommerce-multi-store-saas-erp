# Master Functional Testing Playbook — A-to-Z Verification Checklist

This master playbook acts as your central validation matrix. Change `- [ ]` to `- [x]` as you verify each feature.

---

## 📂 Verification Checklist & Criteria Mappings

### 📦 Module 1: Platform Administration & Store Onboarding
* **Testing Guide**: 🔗 [01_onboarding_system.md](file:///home/gowtamkumar/projects/eCommerce-multi-store-saas/doc/testing/01_onboarding_system.md)

* [ ] **Feature 1.1: System Store Onboarding**
  * *Verification*: Submit onboarding request via `POST /api/v1/system/stores/onboard`.
  * *Success State*: HTTP `201`. Row added to `stores` table with `status = 'ACTIVE'`. Standard Chart of Accounts (COA) seeded in `accounts` table.
  * *Failure Boundary*: HTTP `409` on duplicate subdomain. HTTP `400` on invalid plan UUID.

* [ ] **Feature 1.2: Custom Domain Setup**
  * *Verification*: Save custom domain link via `POST /api/v1/system/stores/domain`.
  * *Success State*: HTTP `200`. Store row `customDomain` populated; `customDomainStatus` = `'PENDING'`.

* [ ] **Feature 1.3: CNAME & DNS Validation**
  * *Verification*: Trigger domain verification via `POST /api/v1/system/stores/domain/verify`.
  * *Success State*: HTTP `200`. `customDomainStatus` transitions to `'VERIFIED'`. `customDomainVerifiedAt` gets timestamp. `sslEnabled = true`.
  * *Failure Boundary*: HTTP `422` or status remains `'FAILED'` if CNAME is not set up correctly.

* [ ] **Feature 1.4: Subscription Plan Gating**
  * *Verification*: Restrict access to premium modules (e.g., HRM, AI) based on subscription plan tier.
  * *Success State*: Controller returns `403 Forbidden` if the store's plan features list does not contain the required feature tag (handled by `SubscriptionGuard`).

* [ ] **Feature 1.5: Subscription Expiry Enforcement**
  * *Verification*: Simulate plan expiration by manually updating `subscriptionEndsAt` to a past timestamp in `stores`.
  * *Success State*: Admin Dashboard displays a full-screen expiration block. All non-public APIs return `403 Forbidden`.

* [ ] **Feature 1.6: Super-Admin Metrics Dashboard**
  * *Verification*: Access platform metrics via `GET /api/system/metrics`.
  * *Success State*: HTTP `200` returning system resource usage, total stores count, and request traffic logs.

---

### 🔑 Module 2: Authentication, Security & RBAC
* **Testing Guide**: 🔗 [02_auth_rbac_system.md](file:///home/gowtamkumar/projects/eCommerce-multi-store-saas/doc/testing/02_auth_rbac_system.md)

* [ ] **Feature 2.1: User Login & JWT Issuance**
  * *Verification*: Submit credentials via `POST /api/v1/admin/login`.
  * *Success State*: HTTP `200` returning `accessToken` and `refreshToken`. Secure HTTP-only cookie `token` is set in the response headers.
  * *Failure Boundary*: HTTP `401 Unauthorized` for incorrect password.

* [ ] **Feature 2.2: Active Session Audit Logs**
  * *Verification*: Query active sessions via `GET /api/v1/admin/users/sessions`.
  * *Success State*: Returns session list with client IP addresses, browser user-agents, and log-in times from the `sessions` table.

* [ ] **Feature 2.3: Session Logouts & Revocation**
  * *Verification*: Revoke sessions via `DELETE /api/v1/admin/users/sessions/:id`.
  * *Success State*: HTTP `200`. Session record `revoked_at` is set to the current timestamp. Access token is rejected on subsequent calls.

* [ ] **Feature 2.4: Staff Invitation Flow**
  * *Verification*: Send email invitation via `POST /api/v1/admin/users/team/invite`.
  * *Success State*: Row is added to `staff_invitations` with status `PENDING`. Invitation email with sign-up token is sent to MailHog.

* [ ] **Feature 2.5: Invitation Acceptance**
  * *Verification*: Accept invitation via `POST /api/v1/auth/accept-invitation` using the token from MailHog.
  * *Success State*: User record created with `isStaff = true`. Invitation status updates to `ACCEPTED`. Role is automatically assigned.

* [ ] **Feature 2.6: Branch Scoping Gating**
  * *Verification*: Scoped cashier attempts to query orders from another branch via `GET /api/v1/admin/orders?branchId=...`.
  * *Success State*: Request rejected with `403 Forbidden` by the `BranchScopeGuard`.

* [ ] **Feature 2.7: Warehouse Scoping Gating**
  * *Verification*: Scoped clerk attempts stock adjustments in another warehouse.
  * *Success State*: Request rejected with `403 Forbidden` by the `BranchScopeGuard`.

* [ ] **Feature 2.8: Direct User Permission Overrides**
  * *Verification*: Explicitly GRANT or REVOKE a permission code for a user via overrides.
  * *Success State*: User override takes priority over role settings. Row created in `user_permission_overrides`.

---

### 🏢 Module 3: Physical & Financial Setup (COA)
* **Testing Guide**: *Pending Creation*

* [ ] **Feature 3.1: Branch Configuration**
  * *Verification*: Create a branch via `POST /api/v1/organization/branches`.
  * *Success State*: HTTP `201`. Row added to `branches` table with the active `storeId`.

* [ ] **Feature 3.2: Warehouse & Bin Setup**
  * *Verification*: Create warehouse and bin codes via `POST /api/v1/organization/warehouses` and `/bins`.
  * *Success State*: Rows added to `warehouses` and `warehouse_bins`. Bin structure follows parent-child routing.

* [ ] **Feature 3.3: Chart of Accounts Seeding**
  * *Verification*: Verify standard accounts exist post-onboarding.
  * *Success State*: Accounts `1010`, `1200`, `2100`, `4010`, `5010` are present in `accounts` table.

* [ ] **Feature 3.4: Custom Sub-Account Creation**
  * *Verification*: Add sub-account via `POST /api/v1/accounting/accounts`.
  * *Success State*: Row created with parent account code link. Sub-account balances roll up to the parent in COA reports.

---

### 🏷️ Module 4: Product Catalog & Batch/Lot Registry
* **Testing Guide**: *Pending Creation*

* [ ] **Feature 4.1: Product & Variant Configuration**
  * *Verification*: Create product with variations via `POST /api/v1/catalog/products`.
  * *Success State*: Rows created in `products` and `product_variants`. Unique SKU and barcodes mapped.

* [ ] **Feature 4.2: Price Book Pricing**
  * *Verification*: Assign variant price via `POST /api/v1/catalog/prices`.
  * *Success State*: Row added to `product_prices`. Correct currency and prices resolved at checkout.

* [ ] **Feature 4.3: Batch Expiry (FEFO Lot) Registry**
  * *Verification*: Register batch expiry dates via `POST /api/v1/catalog/batches`.
  * *Success State*: Batch lot created with manufactured and expiry dates in `product_batches`.
  * *Validation check*: Cart checkouts automatically allocate stock from the earliest expiring batch.

---

### 🛒 Module 5: Procurement & Accounts Payable (AP)
* **Testing Guide**: *Pending Creation*

* [ ] **Feature 5.1: Purchase Requisition to PO Conversion**
  * *Verification*: Create requisition and convert it to PO.
  * *Success State*: PO created with status `SENT`. PDF purchase order emailed to supplier.

* [ ] **Feature 5.2: Supplier Invoice Intake**
  * *Verification*: Submit supplier invoice via `POST /api/v1/purchase/invoices`.
  * *Success State*: Invoice status is saved as `PENDING`. Linked to PO.

* [ ] **Feature 5.3: 3-Way Matching Validation**
  * *Verification*: Run matching checks comparing PO, GRN, and Invoice values.
  * *Success State*: Invoice approved if quantities match. Rejected with variance alert if Invoice Qty > GRN Qty.

* [ ] **Feature 5.4: Supplier Payment Settlement**
  * *Verification*: Release payment via `POST /api/v1/purchase/payments`.
  * *Success State*: Ledger posts debit AP / credit Cash:
    * **DEBIT**: `2100` — Accounts Payable
    * **CREDIT**: `1011` — Bank Operating Account
  * Invoice payment status updates to `PAID`.

---

### 📦 Module 6: Logistics, GRN & Warehouse Operations
* **Testing Guide**: *Pending Creation*

* [ ] **Feature 6.1: Goods Received Note (GRN) Verification**
  * *Verification*: Confirm PO goods receipt via `POST /api/v1/logistics/grn/verify`.
  * *Success State*: Stock ledger increments. General ledger posts:
    * **DEBIT**: `1200` — Inventory Asset
    * **CREDIT**: `2100` — Accounts Payable
  * *Verification query*: `SELECT * FROM inventory_ledger WHERE reference_type = 'GRN'`.

* [ ] **Feature 6.2: Lot Number Allocations**
  * *Verification*: Input batch numbers during GRN verification.
  * *Success State*: Stock allocations map to the corresponding `product_batches` row.

---

### 💸 Module 7: POS Shift Management & Drawer Control
* **Testing Guide**: *Pending Creation*

* [ ] **Feature 7.1: Shift Openings**
  * *Verification*: Open shift with float cash via `POST /api/v1/sales/pos/shifts/open`.
  * *Success State*: Shift status is saved as `OPEN`. Ledger posts:
    * **DEBIT**: `1010` — Cash on Hand
    * **CREDIT**: `1011` — Bank Operating Account

* [ ] **Feature 7.2: Drawer Payouts (Cash Out)**
  * *Verification*: Withdraw cash for office expenses.
  * *Success State*: Transaction added to `pos_drawer_transactions` with type `CASH_OUT`. Cashier shift expected cash is adjusted downwards.

* [ ] **Feature 7.3: Shift Close & Reconciliation**
  * *Verification*: Close shift with counted cash.
  * *Success State*: Z-Report details printed. Variance between expected and counted cash is saved to `pos_shifts` table under the `difference` column.

---

### 💳 Module 8: Point-of-Sale (POS) Register Checkout
* **Testing Guide**: *Pending Creation*

* [ ] **Feature 8.1: Barcode Scan Checkout**
  * *Verification*: Add items to POS cart by SKU/barcode.
  * *Success State*: Subtotals and VAT taxes recalculate correctly.

* [ ] **Feature 8.2: Multi-Tender Split Payments**
  * *Verification*: Check out using split cash and mobile money methods.
  * *Success State*: Ledger posts:
    * **DEBIT**: `1010` — Cash on Hand (for cash portion)
    * **DEBIT**: `1015` — Mobile Money / bKash (for mobile portion)
    * **CREDIT**: `4010` — Sales Revenue
    * **CREDIT**: `2250` — VAT Payable

* [ ] **Feature 8.3: Inventory COGS Deductions**
  * *Verification*: Complete POS sale.
  * *Success State*: Inventory asset value deducts. Ledger posts:
    * **DEBIT**: `5010` — Cost of Goods Sold (COGS)
    * **CREDIT**: `1200` — Inventory Asset

---

### 📶 Module 9: Offline POS Operations & Idempotent Sync
* **Testing Guide**: *Pending Creation*

* [ ] **Feature 9.1: Offline Cart Caching**
  * *Verification*: Checkout with offline network.
  * *Success State*: Cart items are successfully saved to browser `IndexedDB` with a generated `clientSaleId`.

* [ ] **Feature 9.2: Reconnection Sync**
  * *Verification*: Restore network connectivity.
  * *Success State*: POS automatically uploads cached orders to `/api/admin/sales/pos/sync`. Orders process and local caches clear.

* [ ] **Feature 9.3: Sync Idempotency Guard**
  * *Verification*: Send the same offline payload twice.
  * *Success State*: Server ignores duplicate writes, returning `200 OK` and preventing double-deductions.

---

### 🚚 Module 10: Logistics, Fulfillment & Courier Integrations
* **Testing Guide**: *Pending Creation*

* [ ] **Feature 10.1: Picking & Packing Assignments**
  * *Verification*: Assign orders to fulfillment slots.
  * *Success State*: Status updates to `PACKED`. Inventory reservations transition to fulfilled state.

* [ ] **Feature 10.2: Courier API Webhook Updates**
  * *Verification*: Send a simulated courier webhook (e.g. Steadfast webhook) to API.
  * *Success State*: Order shipping status updates. Courier tracking references are saved in `orders` table.

---

### 🔄 Module 11: Logistics Stock Transfers
* **Testing Guide**: *Pending Creation*

* [ ] **Feature 11.1: Stock Transfer Approvals**
  * *Verification*: Approve transfer request. Status -> `APPROVED`.

* [ ] **Feature 11.2: Stock Transfer Dispatches**
  * *Verification*: Mark transfer as `IN_TRANSIT`.
  * *Success State*: Stock ledger in source warehouse is decremented. Destination stock remains unchanged.

* [ ] **Feature 11.3: Stock Transfer Receipts**
  * *Verification*: Mark transfer as `RECEIVED` at destination.
  * *Success State*: Destination stock ledger increments. Transfer status updates to `RECEIVED`.

---

### 👥 Module 12: Customer CRM & B2B Credit Systems
* **Testing Guide**: *Pending Creation*

* [ ] **Feature 12.1: Credit Limit Check**
  * *Verification*: Checkout order on credit terms for B2B client.
  * *Success State*: Checkout blocked if order value exceeds B2B credit limit. Otherwise, outstanding balance updates in `ar_ledger`.

* [ ] **Feature 12.2: Wallet Prepaid Deposits**
  * *Verification*: Add cash credit to customer wallet.
  * *Success State*: Wallet ledger increments. Ledger posts:
    * **DEBIT**: `1010` — Cash on Hand
    * **CREDIT**: `2300` — Store Credit Liability (Wallet)

* [ ] **Feature 12.3: CRM Loyalty Point Ledger**
  * *Verification*: Complete checkout.
  * *Success State*: Points write to `loyalty_ledger` table.

---

### 🔄 Module 13: Sales Returns, Restocking & Refunds
* **Testing Guide**: *Pending Creation*

* [ ] **Feature 13.1: Return Quantity Audits**
  * *Verification*: Submit return request.
  * *Success State*: Request rejected if return qty > purchased qty.

* [ ] **Feature 13.2: Restocking Journal entries**
  * *Verification*: Approve and restock return.
  * *Success State*: Stock ledger increments. Ledger posts:
    * **DEBIT**: `1200` — Inventory Asset
    * **CREDIT**: `5010` — Cost of Goods Sold

* [ ] **Feature 13.3: Wallet Refund Disbursements**
  * *Verification*: Refund return value to customer wallet.
  * *Success State*: Wallet balance credits. Ledger posts:
    * **DEBIT**: `4010` — Sales Revenue
    * **DEBIT**: `2250` — VAT Payable
    * **CREDIT**: `2300` — Store Credit Liability

---

### 📅 Module 14: Geofenced HRM Attendance System
* **Testing Guide**: *Pending Creation*

* [ ] **Feature 14.1: Geofenced Clock-In Punching**
  * *Verification*: Punch attendance from coordinates outside the branch boundary.
  * *Success State*: API rejects punch with `400 Bad Request` (Out of Geofence). Accept punch when coordinates match.

* [ ] **Feature 14.2: Daily Session Aggregations**
  * *Verification*: Trigger clock-out at end of shift.
  * *Success State*: Attendance logs aggregate raw punches, computing total work minutes.

---

### 💵 Module 15: Monthly Payroll & GL Integration
* **Testing Guide**: *Pending Creation*

* [ ] **Feature 15.1: Monthly Payroll Runs**
  * *Verification*: Run payroll for billing month. Net Pay matches calculations.

* [ ] **Feature 15.2: Payroll Batch Approvals**
  * *Verification*: Approve payroll batch.
  * *Success State*: Ledger posts expense allocations:
    * **DEBIT**: `6100` — Salary Expense
    * **CREDIT**: `2200` — Salaries Payable

* [ ] **Feature 15.3: Payroll Payment Releases**
  * *Verification*: Release salary bank payouts.
  * *Success State*: Ledger posts settlement entries:
    * **DEBIT**: `2200` — Salaries Payable
    * **CREDIT**: `1011` — Bank Operating Account

---

### 📈 Module 16: Financial Ledger, Auditing & Compliance
* **Testing Guide**: *Pending Creation*

* [ ] **Feature 16.1: Balanced Ledger Checks**
  * *Verification*: Attempt manual unbalanced journal posting.
  * *Success State*: Posting rejected by database constraints (`ΣDebit = ΣCredit` validation).

* [ ] **Feature 16.2: Fiscal Period Locking**
  * *Verification*: Lock fiscal period and attempt journal postings to the locked date range.
  * *Success State*: API rejects the posting with a `FiscalPeriodLocked` error.

---

### 💬 Module 17: Live Chat & Human Support
* **Testing Guide**: *Pending Creation*

* [ ] **Feature 17.1: Live Chat Client Connections**
  * *Verification*: Connect custom support widget via WebSockets.
  * *Success State*: Client registers on WebSocket room, receiving messages.

---

### 🌐 Module 18: Public Storefront Website (Customer Experience)
* **Testing Guide**: *Pending Creation*

* [ ] **Feature 18.1: Cart & Checkout Pipelines**
  * *Verification*: Add items, input shipping details, and place guest order.
  * *Success State*: Order is logged, stock decrements, and order details page displays.

---

### 🤖 Module 19: Storefront AI Integration (BYOK)
* **Testing Guide**: *Pending Creation*

* [ ] **Feature 19.1: Semantic Hybrid Search**
  * *Verification*: Type query on search bar.
  * *Success State*: Results merge keyword hits and vector rankings using Reciprocal Rank Fusion (RRF).

---

### ⚙️ Module 20: System Caching, Notifications & Infrastructure
* **Testing Guide**: *Pending Creation*

* [ ] **Feature 20.1: Caching Eviction**
  * *Verification*: Update product price.
  * *Success State*: Cached price details in Redis are evicted, and subsequent reads fetch the fresh value.
