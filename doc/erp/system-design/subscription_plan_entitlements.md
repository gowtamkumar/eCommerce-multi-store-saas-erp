# Multi-Tenant SaaS Subscription Plan Entitlements & Feature Mappings

This document outlines the **Core Entitlements and Plan-Tier Mappings** for the multi-tenant SaaS ERP platform. It serves as the definitive reference guide for product owners, sales personnel, and engineers, bridging the gap between tenant-level **Subscription Plans** and individual user-level **Dynamic RBAC Permissions**.

---

## 1. Dual-Layer Security Model: Plan Features vs. RBAC Permissions

To fully secure any ERP resource, the system enforces a **two-key validation** process. An action is granted only when **both** validation keys are present.

```
                  🔑 KEY 1: TENANT LEVEL             🔑 KEY 2: USER LEVEL
               ┌───────────────────────────┐      ┌───────────────────────────┐
               │    Subscription Plan      │      │    Dynamic RBAC Role      │
               │  Is this feature flag     │      │   Does this specific user │
               │   unlocked for this       │      │  possess the required     │
               │        tenant?            │      │     permission slug?      │
               └─────────────┬─────────────┘      └─────────────┬─────────────┘
                             │                                  │
                             └────────────────┬─────────────────┘
                                              │
                                              ▼
                              ✅ Resource Access Granted
```

1. **Layer 1: Subscription Gate (Tenant-Level):** Checks if the tenant's plan features (`tenant_features` mapped from `subscription_plans`) includes the required feature route decorator (e.g. `@RequireFeature('/admin/hrm')`).
2. **Layer 2: Permission Gate (User-Level):** Resolves the user's dynamic roles and overrides (`@RequirePermissions(SystemPermissions.HRM_VIEW)`) to ensure the logged-in staff member has explicit clearance for that action.

---

## 2. Subscription Plan Tiers & Entitlements

The platform features three standardized billing tiers. Each tier incrementally unlocks advanced ERP operational features.

```
   ┌────────────────────────────────────────────────────────────────────────┐
   │                               ENTERPRISE                               │
   │  → Multi-Branch & Warehouses, general ledgers, payroll, custom APIs    │
   ├────────────────────────────────────────────────────────────────────────┤
   │                               PRO SELLER                               │
   │  → Unlimited catalog, basic procurement, POS register, analytics       │
   ├────────────────────────────────────────────────────────────────────────┤
   │                              STARTER (FREE)                            │
   │  → Storefront profile, single category, pages builder, manual billing  │
   └────────────────────────────────────────────────────────────────────────┘
```

### 2.1 Starter Plan (Free/Trial)
Designed for single-store small businesses starting their online presence.
* **Monthly Price:** $0.00
* **Core Entitlements:** Basic storefront configuration and single-location catalog.
* **Unlocked Feature Slugs:**
  - `/admin` (Dashboard landing page)
  - `/admin/products` (Basic listing/creating)
  - `/admin/categories` (Basic organization)
  - `/admin/media` (Media library upload)
  - `/admin/profile` (User settings)
  - `/admin/faqs` (Manage customer help pages)

### 2.2 Pro Seller Plan
Ideal for growing retail stores requiring automated POS operations, customer relationship features, and marketing workflows.
* **Monthly Price:** $29.00
* **Core Entitlements:** Starter features + Point of Sale, Coupon/Promotion suites, basic Expense & Purchase tracking.
* **Unlocked Feature Slugs:**
  - All Starter Features
  - `/admin/pos` (Retail POS terminal checkout)
  - `/admin/orders` (Orders listing and lifecycle management)
  - `/admin/customers` (CRM listing and details)
  - `/admin/subscribers` (Manage email subscribers)
  - `/admin/promotions` (Discount rules and banners)
  - `/admin/coupons` (Coupon code engine)
  - `/admin/pages` (Dynamic content and pages builder)
  - `/admin/reviews` (Customer review moderations)
  - `/admin/expenses` (Basic cost tracking)
  - `/admin/fulfillment` (Order packing and manual status updates)
  - `/admin/couriers` (Integrate shipping routes/rules)
  - `/admin/settings` (Tenant configuration, custom SEO profiles)

### 2.3 Enterprise Plan
Optimized for multi-tenant organizations with multi-branch corporate governance, full accounting ledgers, advanced supply chain management, and HRM payroll systems.
* **Monthly Price:** $99.00
* **Core Entitlements:** Pro Seller features + Multi-Warehouse scoping, Purchase Order flows, Goods Received Notes (GRN), Balance Sheets, General Ledger, and Employee Attendance/Payroll.
* **Unlocked Feature Slugs:**
  - All Pro Seller Features
  - `/admin/warehouses` (Multi-warehouse and branch scaling)
  - `/admin/hrm` (Full HRM dashboards, Shifts, Payroll, Leave control)
  - `/admin/inventory` (Dynamic stock ledger tracking with transaction records)
  - `/admin/finance` (Financial dashboards)
  - `/admin/finance/profit-loss` (P&L reporting)
  - `/admin/finance/balance-sheet` (Balance Sheet audit tool)
  - `/admin/finance/ledger` (Immutable transactional general ledger)
  - `/admin/invoices` (Audit-compliant financial invoices)
  - `/admin/purchases` (Advanced Procurement, requisition orders)
  - `/admin/grn` (Goods Received Note verification engine)
  - `/admin/suppliers` (Full Supplier Relationship Management - SRM)
  - `/admin/reports` (Granular sales reports, supplier ledgers, customer ledgers, cash flows)

---

## 3. Subscription Entitlements Matrix

| Feature / Module Path | Starter (Free) | Pro Seller ($29) | Enterprise ($99) | Backend Guard Identifier |
| :--- | :---: | :---: | :---: | :--- |
| **Basic Dashboard** | ✅ | ✅ | ✅ | `/admin` |
| **Media Library** | ✅ | ✅ | ✅ | `/admin/media` |
| **Basic Products** | ✅ (Limited) | ✅ | ✅ | `/admin/products` |
| **Categories & Brands** | ✅ | ✅ | ✅ | `/admin/categories`, `/admin/brands` |
| **FAQs Manager** | ✅ | ✅ | ✅ | `/admin/faqs` |
| **POS Terminal (Point of Sale)** | ❌ | ✅ | ✅ | `/admin/pos` |
| **Orders & Fulfillment** | ❌ | ✅ | ✅ | `/admin/orders`, `/admin/fulfillment` |
| **Couriers & Shipments** | ❌ | ✅ | ✅ | `/admin/couriers` |
| **Coupon/Promo Engine** | ❌ | ✅ | ✅ | `/admin/coupons`, `/admin/promotions` |
| **Pages Builder** | ❌ | ✅ | ✅ | `/admin/pages` |
| **Customer Reviews** | ❌ | ✅ | ✅ | `/admin/reviews` |
| **Expenses Module** | ❌ | ✅ | ✅ | `/admin/expenses` |
| **Custom Settings & SEO** | ❌ | ✅ | ✅ | `/admin/settings` |
| **Multi-Branch & Warehouses** | ❌ | ❌ | ✅ | `/admin/warehouses` |
| **SCM Procurement & SRM** | ❌ | ❌ | ✅ | `/admin/purchases`, `/admin/suppliers` |
| **GRN Receiving** | ❌ | ❌ | ✅ | `/admin/grn` |
| **HRM & Payroll Dashboard** | ❌ | ❌ | ✅ | `/admin/hrm` |
| **Inventory Transaction Ledger**| ❌ | ❌ | ✅ | `/admin/inventory` |
| **Finance General Ledger** | ❌ | ❌ | ✅ | `/admin/finance/ledger` |
| **Balance Sheet & P&L** | ❌ | ❌ | ✅ | `/admin/finance/balance-sheet` |
| **Granular Export Center** | ❌ | ❌ | ✅ | `/admin/reports/export` |

---

## 4. Operational Playbook for Entitlements Administration

### 4.1 Plan Upgrades
When a tenant upgrades from **Pro Seller** to **Enterprise**:
1. The billing integration completes the transaction and updates the tenant's `subscription_plan_id`.
2. The system triggers a cache-invalidation event: `cacheService.delCache("tenant_features:" + tenantId)`.
3. Next time the user's browser triggers an action, the refreshed JWT or `user.features` manifest automatically exposes the Enterprise paths.

### 4.2 Plan Downgrades
When a tenant downgrades to **Starter**:
1. Feature flags for modules like `/admin/hrm` are set to inactive.
2. If a tenant user goes directly to `/admin/hrm/employees` via their browser address bar, the backend `SubscriptionGuard` immediately intercept the request, validates the Starter tier, and returns a `403 Feature Locked` payload.
3. The custom roles configured under Enterprise (e.g. "HR Assistant") are **preserved** (not deleted) but become completely inactive until the tenant re-subscribes.

---

*This entitlements schema ensures a robust, secure, and clean separation of SaaS plan-based gating and individual role-based security.*
