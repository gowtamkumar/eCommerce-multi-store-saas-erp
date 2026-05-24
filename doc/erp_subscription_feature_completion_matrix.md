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
| Attendance & payroll | **Not implemented** | No payroll or attendance modules found. |
| Advanced RBAC | **Partial** | `UserRole`, guards, and `Roles` / `RequireFeature` patterns exist; granularity is platform-oriented, not ERP-style per-action retail permissions (e.g. “cannot edit price”). |

### 1.6 CRM & customer loyalty

| ERP feature | Status | Notes |
| :--- | :---: | :--- |
| Customer credit limits | **Not implemented** | No B2B credit limit on customers identified. |
| Loyalty & rewards | **Not implemented** | Coupons/promotions exist; no points-based loyalty program. |
| Customer segmentation | **Partial** | Leads/subscribers/customers modules give light CRM; not segmentation-driven price lists or campaigns as in the ERP row. |

### 1.7 Business intelligence (BI)

| ERP feature | Status | Notes |
| :--- | :---: | :--- |
| Dashboard widgets | **Complete** | Admin analytics charts, report dashboards, finance/sales summaries per `FEATURES.md` and report services. |
| Automated reports (scheduled email) | **Not implemented** | No scheduled email report jobs identified in the scan (stakeholders would rely on manual export / UI). |

---

## 2. `subscription_featured.md` vs current behaviour

The subscription doc describes **plan-scoped feature keys** such as `custom_domain`, `advanced_analytics`, `remove_branding`, `unlimited_products`, `staff_accounts`, and `multi_currency`.

### 2.1 Conceptual coverage

| Documented key | Approximate product support | Status |
| :--- | :--- | :---: |
| `custom_domain` | `TenantEntity` fields `custom_domain`, `custom_domain_status`, migrations | **Complete** (domain model) |
| `advanced_analytics` | Admin analytics and report controllers | **Partial** (capability exists; gating consistency — see below) |
| `remove_branding` | No dedicated feature flag string located matching the doc; storefront “powered by” style strings may still appear in places | **Partial / unclear** |
| `unlimited_products` | Catalog scales by data; explicit plan-enforced caps not verified in this pass | **Unclear** |
| `staff_accounts` | Multi-user tenant admins via user module | **Partial** |
| `multi_currency` | `supported_currencies` in site settings and checkout currency fields | **Partial** |

### 2.2 Documentation vs enforcement (`SubscriptionGuard`)

- `SubscriptionGuard` (`server/src/common/guards/subscription.guard.ts`) grants access only when `tenant.subscriptionPlan.features` **includes the exact string** passed to `@RequireFeature(...)`.
- Controllers predominantly use **route-like** required features, e.g. `/admin/products`, `/admin/inventory`, `/admin/reports/profit-loss`.
- Default plans created in `SuperAdminController` seed **human-readable** labels (e.g. `"Custom Domains"`, `"Unlimited Products"`), not the `/admin/...` paths.

**Implication:** `subscription_featured.md` snake_case keys and the seeded `features` arrays are **not aligned** with how `@RequireFeature` is applied unless plans are manually maintained to list every required path (or the guard is refactored to map logical keys to routes). Treat the subscription matrix as **aspirational / outdated** relative to live enforcement until reconciled.

---

## 3. Quick alignment with `FEATURES.md`

Capabilities called out in `FEATURES.md` (multi-tenant, orders, Pathao/Steadfast, SSLCommerz, coupons, expenses, reviews, SEO, etc.) sit **mostly under eCommerce + light operations finance**, not full ERP/POS. That matches this matrix: **procurement-ish and reporting pieces exist**, while **branch inventory, POS, GL, HRM, loyalty, and automated BI digests** remain gaps versus `erp_feature_list.md`.

---

## 4. Suggested next steps (optional)

1. **Normalize subscription features:** choose either logical keys (`custom_domain`) or route keys (`/admin/...`) and map them in one place so `SubscriptionGuard` and Super Admin seed data agree.  
2. **ERP prioritization:** if moving toward the ERP doc, typical high-value sequences are multi-location inventory → POS → GL/AP depth, depending on vertical.  
3. **Low-hanging ERP gaps:** outbound low-stock notifications and explicit tax reporting hooks often ship before full GL.

---

*This file is generated for planning and review; it is not a legal or audit statement of functionality.*
