# Senior Engineering Guide: Subscription Plan Setup & Entitlements Engine

This guide details the technical specifications, architectural flow, and database setup instructions for the **Decoupled Abstract Keys (Entitlements)** subscription engine implemented in our multi-store SaaS ERP.

---

## 1. Architectural Philosophy

In a large-scale ERP, coupling plan subscriptions directly to URL paths is a critical anti-pattern. Instead, our design separates the **Business Entitlements** (stored in the database) from the **Access Mechanics** (handled dynamically in code).

```mermaid
graph TD
    A[Stripe Plan / DB Subscription] -->|Abstract Key: pos| B(Backend Mapping Engine)
    B -->|Resolves to Paths| C[/admin/pos]
    B -->|Resolves to Paths| D[/admin/pos-registers]
    E[HTTP Request: GET /admin/pos-registers] -->|SubscriptionGuard| F{Reverse Mapping Lookup}
    F -->|Maps back to pos| G{Does Store have 'pos' entitlement?}
    G -->|Yes| H[Allow Access]
    G -->|No| I[403 Forbidden]
```

### Key Advantages of This Philosophy:
* **Zero DB Drift**: If the URL for POS Registers changes from `/admin/pos-registers` to `/admin/registers`, you only update the code mapping. Existing plans in the database remain completely untouched.
* **Metadata Limits**: Easily fits within Stripe/PayPal plan metadata character limits (which fail if raw route paths are passed).
* **Bundle Scaling**: Adding a new page to the HRM module (e.g. `/admin/hrm/shifts`) automatically grants access to all merchants on that plan without executing database migration scripts.

---

## 2. Database Schema Configuration

The core model `SubscriptionPlanEntity` holds the system tier records, billing details, Stripe identifiers, and quantitative quotas.

### Entity Attributes

| Field Name | Type | Purpose / Sample Values |
| :--- | :--- | :--- |
| **code** | `string` | Unique URL-safe identifier (e.g. `'starter'`, `'pro_seller'`) |
| **name** | `string` | Public display name of the tier (e.g. `'Pro Seller'`) |
| **price** | `decimal` | Base plan price |
| **monthlyPrice** | `decimal` | Monthly payment threshold |
| **yearlyPrice** | `decimal` | Annual payment threshold (discounted) |
| **trialPeriodDays** | `int` | Length of trial period in days (e.g., `14` or `30`) |
| **features** | `jsonb (string[])` | **Abstract Entitlement Keys** (e.g. `["pos", "catalog", "marketing", "header"]`) |
| **maxBranches** | `int` | Branch location threshold limit |
| **maxWarehouses** | `int` | Warehouse storage location limit |
| **maxStaffUsers** | `int` | Maximum active team member user accounts allowed |
| **maxProducts** | `int` | Catalog SKU listing threshold |
| **maxMonthlyOrders** | `int` | Maximum transactional checkout logs per month |
| **maxStorageMb** | `int` | Merchant asset storage limit |
| **stripePriceIdMonthly** | `string` | Stripe Price API lookup token for monthly billing |
| **stripePriceIdYearly** | `string` | Stripe Price API lookup token for yearly billing |

---

## 3. Translation Engine (`feature-mapping.ts`)

Located at [feature-mapping.ts](file:///home/gowtamkumar/projects/eCommerce-multi-store-saas/server/src/common/constants/feature-mapping.ts), the translation engine registers all ERP sub-routes and translates between route paths and abstract keys.

> [!NOTE]
> All nested sub-routes must be mapped to their parent feature to prevent route guards from raising unauthorized access errors when users visit child views.

```typescript
export const FEATURE_TO_ROUTES_MAPPING: Record<string, string[]> = {
  pos: ['/admin/pos', '/admin/pos-registers'],
  finance: [
    '/admin/finance',
    '/admin/finance/profit-loss',
    '/admin/finance/balance-sheet',
    '/admin/finance/ledger',
    '/admin/finance/ar',
    '/admin/finance/ap',
    '/admin/finance/wallet',
    '/admin/finance/accounts',
    '/admin/finance/cash-flow',
    '/admin/finance/fiscal-periods',
    '/admin/finance/tax',
    '/admin/expenses',
  ],
  hrm: [
    '/admin/hrm',
    '/admin/hrm/dashboard',
    '/admin/hrm/employees',
    '/admin/hrm/departments',
    '/admin/hrm/designations',
    '/admin/hrm/attendance',
    '/admin/hrm/leaves',
    '/admin/hrm/shifts',
    '/admin/hrm/payroll',
    '/admin/hrm/recruitment',
    '/admin/hrm/performance',
  ],
  orders: [
    '/admin/orders',
    '/admin/carts',
    '/admin/returns',
    '/admin/payments',
    '/admin/invoices',
    '/admin/customers',
  ],
  catalog: [
    '/admin/products',
    '/admin/categories',
    '/admin/brands',
    '/admin/price-books',
    '/admin/media',
    '/admin/reviews',
  ],
  inventory: [
    '/admin/inventory',
    '/admin/warehouses',
    '/admin/stock-transfers',
    '/admin/batches',
    '/admin/cycle-count',
  ],
  purchasing: [
    '/admin/purchases',
    '/admin/suppliers',
    '/admin/grn',
    '/admin/procurement/dashboard',
    '/admin/procurement/suppliers',
    '/admin/procurement/requisitions',
    '/admin/procurement/rfqs',
    '/admin/procurement/purchases',
    '/admin/procurement/grn',
    '/admin/procurement/invoices',
    '/admin/procurement/debit-notes',
  ],
  marketing: [
    '/admin/campaigns',
    '/admin/coupons',
    '/admin/promotions',
    '/admin/subscribers',
    '/admin/leads',
    '/admin/reports/marketing',
    '/admin/marketing/loyalty',
  ],
  settings: [
    '/admin/settings',
    '/admin/team',
    '/admin/roles',
    '/admin/audit-logs',
  ],
  header: ['/admin/settings/navbar'],
  footer: ['/admin/settings/footer'],
  
  // Legacy Marketing Aliases (for 100% backward-compatibility)
  staff_accounts: ['/admin/hrm'],
  unlimited_products: ['/admin/products'],
  navbar: ['/admin/settings/navbar'],
}
```

---

## 4. Backend Request Authentication (`SubscriptionGuard`)

Every controller endpoint maps back to a specific capability gate using `@RequireFeature('route')`. The [SubscriptionGuard](file:///home/gowtamkumar/projects/eCommerce-multi-store-saas/server/src/common/guards/subscription.guard.ts) evaluates access dynamically against the store's plan features:

> [!TIP]
> Super Admin accounts automatically bypass all guards.

```typescript
const featureSlug = requiredFeature;

// Verify if plan has the feature
const store = await this.storeService.findOneStores(storeId);
const planFeatures = store.subscriptionPlan?.features || [];

const hasPlanAccess = planFeatures.includes(featureSlug) || planFeatures.includes(requiredFeature);

if (!hasPlanAccess) {
  throw new ForbiddenException("Upgrade your plan to access this feature.");
}
```

---

## 5. Frontend Session & UI Gating (`routes.ts`)

To avoid querying the Postgres database on every single page load or link hover, we use a hybrid token authentication strategy:

1. **Pre-Compiled Session JWT**: During login, `auth.service.ts` expands abstract keys to their respective route lists via `expandFeatures(...)` and signs them into the user JWT payload.
2. **Instant Local Sidebar Checks**: The [AdminLayout.tsx](file:///home/gowtamkumar/projects/eCommerce-multi-store-saas/client/features/admin/dashboard/components/AdminLayout.tsx) navigation filters items on the fly:
   ```typescript
   if (item.feature) {
       return features.includes(item.feature);
   }
   ```
3. **Menu Key Alignments**:
   All features inside [routes.ts](file:///home/gowtamkumar/projects/eCommerce-multi-store-saas/client/routes.ts) utilize abstract entitlement keys instead of route strings:
   * Navbar Menu -> `feature: "header"`
   * Footer Menu -> `feature: "footer"`
   * Point of Sale -> `feature: "pos"`
   * Products / Brands -> `feature: "catalog"`
