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
| Multi-branch support | **Not implemented** | Stock is per product/variant within a tenant; no warehouse/branch entities or per-location stock. |
| Stock transfers (in-transit between locations) | **Not implemented** | Inventory transactions attach to product/variant (and optional supplier reference), not inter-location transfers. |
| Batch & expiry management | **Not implemented** | No product batch/lot or expiry fields in the catalog model (distinct from coupon/promotion expiry). |
| Barcode / QR integration | **Partial** | SKUs are first-class on variants (`sku`, uniqueness per tenant) suitable for scanning; no dedicated barcode label generation or scanner-first POS flows. |
| Stock adjustments | **Complete** | Inventory transaction service and admin inventory UI (e.g. stock adjustment modal, transaction history). |
| Low stock alerts | **Partial** | `low_stock_threshold` on products/variants; low-stock counts and listings in reporting/inventory summary. **Automatic outbound alerts** (email/SMS) were not identified. |

### 1.2 Point of sale (POS) & retail

| ERP feature | Status | Notes |
| :--- | :---: | :--- |
| Retail POS interface | **Not implemented** | Checkout is eCommerce-oriented (cart/checkout), not a dedicated counter POS. |
| Offline-first sales | **Not implemented** | No offline queue/sync pattern for sales identified. |
| Shift / register management | **Not implemented** | No cashier shift or register open/close workflow. |
| Multi-payment support (split tender) | **Partial** | Multiple payment methods exist at checkout level (e.g. COD vs gateway); **splitting one order across multiple tenders** is not treated as a first-class POS feature. |
| Return & exchange | **Partial** | Admin return flow with inventory integration (`ReturnService`, `return.controller.ts`). Scope is order-linked returns, not full retail exchange policies at POS. |

### 1.3 Procurement & supply chain

| ERP feature | Status | Notes |
| :--- | :---: | :--- |
| Supplier portal | **Partial** | Supplier CRUD and supplier linkage on products / inventory context (`supplier.controller.ts`, entities). Not a separate vendor self-service portal. |
| Purchase orders (PO) | **Complete** | PO module (create, status including received path, `purchase-order.controller.ts`, queue processor updating stock). |
| Goods received note (GRN) | **Partial** | Receiving is expressed via PO status / receiving flow rather than a distinct GRN document as in classic ERP. |
| Accounts payable | **Partial** | Supplier ledger and purchase payment status support AP-style visibility; not a full AP subledger with invoice matching and payment runs. |

### 1.4 Finance & accounting

| ERP feature | Status | Notes |
| :--- | :---: | :--- |
| General ledger (double-entry) | **Not implemented** | No chart of accounts or double-entry journal model identified. |
| Profit & loss | **Partial** | P&L style reporting exists under admin reports (`/admin/reports/profit-loss`); methodology is reporting-layer, not full GL-backed. |
| Expense tracking | **Complete** | Dedicated expense module (`expense.controller.ts`) aligned with `FEATURES.md`. |
| Tax / VAT engine | **Partial** | `tax_rate` on products and currency handling in orders; not a regional multi-jurisdiction tax engine with filing outputs. |

### 1.5 Human resources (HRM)

| ERP feature | Status | Notes |
| :--- | :---: | :--- |
| Employee records | **Partial** | Tenant-scoped users/staff for the store; not HR profiles, contracts, or branch assignment as described in the ERP doc. |
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
