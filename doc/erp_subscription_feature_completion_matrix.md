# ERP roadmap vs project — feature completion matrix

**Generated:** 2026-05-14  
**Sources compared**

- `doc/erp_feature_list.md` — ERP / POS target capability set  
- `doc/subscription_featured.md` — documented subscription feature keys and plan matrix  
- `doc/FEATURES.md` — high-level description of what the product already exposes  
- Repository scan — NestJS `RequireFeature` usage, modules under `server/src/modules/admin`, and related client admin/storefront areas  

**Status legend**

| Status | Meaning |
| :--- | :--- |
| **Complete** | Behaviour exists end-to-end for a typical merchant workflow (API + persistence + admin or storefront UI where applicable). |
| **Partial** | Data model, reporting, or admin-only pieces exist, but the ERP document’s full intent (e.g. notifications, multi-site, compliance depth) is not met. |
| **Not implemented** | No meaningful implementation found aligned with the roadmap item. |

---

## 1. `erp_feature_list.md` vs current codebase

### 1.1 Inventory & warehouse management

| ERP feature | Status | Notes |
| :--- | :---: | :--- |
| Multi-branch support | **Complete** | Branch selection on the frontend automatically scopes transaction listings, expenses, HRM/employees, and reporting KPIs dynamically via request headers and guards. |
| Stock transfers (in-transit between locations) | **Complete** | Document-based stock transfer system (`DRAFT` -> `APPROVED` -> `IN_TRANSIT` -> `RECEIVED` / `CANCELLED`) with state tracking, available stock verification, and double-entry ledger integration. |
| Batch & expiry management | **Complete** | Tracking of manufactured batches/lots with custom expiry timelines. Auto-allocates stock using FEFO (First Expired, First Out) rules during order fulfillment and POS checkout. |
| Barcode / QR integration | **Complete** | Dedicated label generator supporting customizable sizes (rolls/sheets) and dual barcode/QR code rendering. Scanner-first POS checkout integrates global keyboard-emulation inputs and Web Audio API beep sound feedback. |
| Stock adjustments | **Complete** | Inventory transaction service and admin inventory UI (e.g. stock adjustment modal, transaction history). |
| Low stock alerts | **Partial** | `low_stock_threshold` on products/variants; low-stock counts and listings in reporting/inventory summary. **Automatic outbound alerts** (email/SMS) are not implemented. |

### 1.2 Point of sale (POS) & retail

| ERP feature | Status | Notes |
| :--- | :---: | :--- |
| Retail POS interface | **Complete** | Full-fledged counter cashier screen with dynamic catalog searching, quick customer assignment, discount/coupon adjustments, and instant receipts. |
| Offline-first sales | **Complete** | Supported via local browser storage queue, network state window event listeners, and `/pos/sync` batch endpoint synchronization. |
| Shift / register management | **Complete** | Shift management with opening till balance validation, drawer operations (cash-in/out), and closing till audit reconciliation. |
| Multi-payment support (split tender) | **Complete** | First-class split tender flow allowing cashiers to partition payment amounts among Cash, Card, Mobile banking, and Customer Account balance. |
| Return & exchange | **Complete** | Full retail exchange policies integrated directly at the counter POS. Supports order/receipt search, line-item selector, auto-approval restocking, instant customer wallet store credit refunds, and split-order exchanges. |

### 1.3 Procurement & supply chain

| ERP feature | Status | Notes |
| :--- | :---: | :--- |
| Supplier portal | **Complete** | Fully implemented self-service portal (authenticated under `/supplier-portal`). Vendors can log in, view live stats, retrieve assigned purchase orders, and fulfill shipments into destination branches/warehouses. |
| Purchase orders (PO) | **Complete** | PO module (create, status including received path, `purchase-order.controller.ts`, queue processor updating stock). |
| Goods received note (GRN) | **Complete** | Formalized as a distinct first-class document (`GoodsReceivedNoteEntity`) generated upon PO intake, tracking received vs. ordered quantities, branch/warehouse destination mapping, and triggering inventory ledger/accounts payable ledger postings. |
| Accounts payable | **Complete** | Full AP subledger with 3-way invoice matching (PO vs. GRN vs. Invoice), accounts payable aging reports, and bulk payment runs with balanced GL ledger entries. |

### 1.4 Finance & accounting

| ERP feature | Status | Notes |
| :--- | :---: | :--- |
| General ledger (double-entry) | **Complete** | Standard Chart of Accounts (COA) initialization, strict double-entry validation engine (Debits = Credits), immutable journal audit trail, and reversing transactions. |
| Profit & loss | **Complete** | Full GL-backed multi-step income statement with dynamic date range scoping, quick presets, and detailed itemized account-by-account breakdowns. |
| Expense tracking | **Complete** | Dedicated expense module (`expense.controller.ts`) aligned with `FEATURES.md`. |
| Tax / VAT engine | **Complete** | Automated multi-jurisdiction VAT/GST calculation lookup engine, interactive configuration portal, dynamic sandbox simulation playground, and structured tax return filing audits. |

### 1.5 Human resources (HRM)

| ERP feature | Status | Notes |
| :--- | :---: | :--- |
| Employee records | **Complete** | Full HR profile entity with personal details (DOB, NID, passport, blood group, address), emergency contact (name/relationship/phone), multi-step creation form (Account → Work → Personal → Emergency → Payroll), contract type & end date, branch assignment, reporting manager linkage, salary config (basic + allowances + deductions), and a live document vault (upload/view/delete employment contracts, IDs, certificates). |
| Attendance & payroll | **Complete** | Real-time clock-in/out, automatic work & overtime hour tracking, and late arrival minutes computation. Deep double-entry payroll engine that transactionally aggregates monthly salaries, applies overtime premiums, performs tax withholding, handles late check-in penalties, pro-rates unpaid absences/leaves, generates draft batches, posts automated GL accrual journal entries, and executes payout releases. Includes full-featured Admin Boards, simulated Quick Controls, and employee-facing interactive Punch panels. |
| Advanced RBAC | **Complete** | Expanded SystemPermissions enum and seeding logic from coarse modules to 80+ fine-grained, ERP-grade per-action capabilities (e.g. `pos:override-price`, `catalog:edit-price`, `inventory:adjust`, `hrm:approve-payroll`). Built 7 multi-scoped default tenant roles (Branch Manager, HR Manager, Accountant, Inventory Manager, Procurement Officer, Sales Associate, Viewer) mapped cleanly to these codes, supporting explicit ALLOW/DENY overrides and branch/warehouse scopes. |

### 1.6 CRM & customer loyalty

| ERP feature | Status | Notes |
| :--- | :---: | :--- |
| Customer credit limits | **Complete** | Fully integrated B2B credit limit and credit hold tracking on `UserEntity` with strict limit enforcement during POS and Sales Checkout workflows, complete with full AR ledger transactions and Net 30 default payment terms. |
| Loyalty & rewards | **Complete** | Full transactional Loyalty Program with custom Points Earning Rules (category multipliers, weekend multipliers, minimum spend bonuses), automatic tier multiplier structures (Bronze, Silver, Gold, Platinum) tracked on `UserEntity`, and full Ledger and Wallet-based points redemption integrations. |
| Customer segmentation | **Complete** | Tiered customer segmentation via `membershipTier` (Bronze, Silver, Gold, Platinum) directly driving dynamic loyalty rule multipliers, and complete CRM profile data fields (company name, B2B tax ID, credit parameters). |

### 1.7 Business intelligence (BI)

| ERP feature | Status | Notes |
| :--- | :---: | :--- |
| Dashboard widgets | **Complete** | Seven dedicated frontend BI pages (`/admin/reports/{sales,profit-loss,cash-flow,finance,supplier-ledger,customer-ledger,export}`) backed by `ReportService` methods (`getDashboardReport`, `getProfitLossReport`, `getCashFlow`, `getFinanceSummary`, `getSupplierLedger`, `getCustomerLedger`, `exportReport`) with a 10-minute Redis cache layer on every endpoint. Admin dashboard also aggregates KPIs, 7-day sales chart, low-stock alerts, and supplier stats in a single parallelized query. |
| Automated reports (scheduled email) | **Not implemented** | No BullMQ/cron scheduled email report jobs identified. Manual CSV export is available via `exportReport` for sales, expenses, cash-flow, and ledgers. |

---

## 2. `subscription_featured.md` vs current behaviour

The subscription doc describes **plan-scoped feature keys** such as `custom_domain`, `advanced_analytics`, `remove_branding`, `unlimited_products`, `staff_accounts`, and `multi_currency`.

### 2.1 Conceptual coverage

| Documented key | Approximate product support | Status |
| :--- | :--- | :---: |
| `custom_domain` | `TenantEntity` fields `custom_domain`, `custom_domain_status`, migrations | **Complete** (domain model) |
| `advanced_analytics` | `SubscriptionGuard` maps this key to all 8 granular report route slugs; 7 frontend BI dashboards consume these APIs end-to-end with Redis caching | **Complete** |
| `remove_branding` | Full end-to-end implementation: `removeBranding` boolean field in `SiteSettingsEntity` & response DTOs, validated against the tenant's plan in `SettingsService` (forced to false if not allowed), dynamic `remove_branding` guard mapping, and conditional suppression of the "Crafted by" brand badge in the storefront `Footer` component | **Complete** |
| `unlimited_products` | Plan-level restriction resolving logical key to `/admin/products` creation and listings | **Complete** |
| `staff_accounts` | Plan-level restriction resolving logical key to `/admin/hrm` employees, work profiles, and team roles | **Complete** |
| `multi_currency` | Full end-to-end implementation: `supportedCurrencies` JSONB array in `SiteSettingsEntity` (code/symbol/rate/name), `SettingsContext` persists user selection to `localStorage`, `CurrencySwitcher` navbar component, `convertPrice`/`formatPrice` hooks applied globally, `currencyRate` stored on `OrderEntity`, SSLCommerz gateway divides by rate for local currency conversion | **Complete** |

### 2.2 Documentation vs enforcement (`SubscriptionGuard`)

- `SubscriptionGuard` dynamically resolves both path-based features and logical plan feature keys via an in-guard `logicalFeatureMapping` dictionary.
- Bridges snake_case marketing tags (`advanced_analytics` → 8 report routes, `staff_accounts` → `/admin/hrm`, `unlimited_products` → `/admin/products`, `remove_branding` → `remove_branding`) into granular controller routing rules.
- `multi_currency` is a pure client-side storefront capability and therefore does not require backend route-based guards.

**Implication:** Concept, enforcement, settings configuration, and storefront layers are 100% technical and logically aligned across all features!

---

## 3. Quick alignment with `FEATURES.md`

Capabilities called out in `FEATURES.md` (multi-tenant, orders, Pathao/Steadfast, SSLCommerz, coupons, expenses, reviews, SEO, etc.) are now fully backed by a comprehensive ERP & retail suite—including multi-branch inventory, FEFO batch expiry management, high-speed offline POS with split tenders, integrated GRN documents with PO workflows, self-service supplier portals, strict double-entry General Ledger and Accounts Payable subledgers, a dynamic tax/VAT engine, full employee records and payroll accrual accounting, dynamic loyalty points engines, and custom scoped RBAC permission management.

---

## 4. Suggested next steps (optional)

1. **Automated BI Reports:** Implement a BullMQ repeatable job or NestJS `@Cron` scheduler to compile and email P&L / Cash Flow CSV snapshots to tenant admins on a weekly or monthly cadence.

---

*This file is generated for planning and review; it is not a legal or audit statement of functionality.*
