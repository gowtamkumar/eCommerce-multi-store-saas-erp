# Admin Sidebar Review & Proposal

> Senior engineering review of the current admin navigation in `client/routes.ts`.
> Purpose: identify bugs/inconsistencies, structural problems, and propose a target ERP-grade sidebar that aligns with the rest of the project (operations, finance, CRM/loyalty, WMS, RBAC).
> Date: 2026-05-20

---

## 1. Current State Snapshot

The sidebar today is defined in `client/routes.ts` and contains these groups (in order):

1. Insights
2. Catalog
3. Sales & CRM
4. Procurement
5. Human Resources
6. Operations
7. Finance
8. Marketing
9. Reports
10. Access Control
11. System Settings
12. Storefront & UI

Each group has items with `icon`, `label`, `href`, `feature` (used for RBAC/feature-gate). Some role lists differ per group (`ADMIN`, `STORE_MANAGER`, `OPERATOR`, `SUPPORT`, `MARKETING`, `SUPER_ADMIN`).

Overall it is a solid v1, but several things hurt scaling, RBAC accuracy, and discoverability.

---

## 2. Bugs / Inconsistencies (Fix First)

| # | Issue | Where | Suggested fix |
| :--- | :--- | :--- | :--- |
| 1 | POS uses the wrong feature gate (`/admin/orders` instead of `/admin/pos`) | `Sales & CRM` group, POS item | Use `feature: "/admin/pos"`. |
| 2 | Live Chat has no `feature` key | `Sales & CRM` group | Add `feature: "/admin/support"` — currently RBAC cannot filter it. |
| 3 | All HRM items share the same `feature: "/admin/hrm"` | Whole HRM group | Use granular gates per page (`/admin/hrm/employees`, `/admin/hrm/payroll`, `/admin/hrm/attendance`, …). Right now anyone with HRM access can see Payroll. |
| 4 | "Newsletter" label points to `/admin/leads` | Marketing group | Either rename label to "Leads" or change href to `/admin/newsletter`. |
| 5 | "Profit & Loss" exists in both Finance and Reports with different feature paths | Finance + Reports | Keep statements in Finance only; Reports should link to the same canonical page or remove the duplicate. |
| 6 | "Audit Logs" uses `feature: "/admin/team"` | Access Control | Should be its own gate `feature: "/admin/audit-logs"`. |
| 7 | "Active Carts" uses the same `ShoppingBag` icon as Orders and POS | Sales group | Use a different icon (for example `ShoppingCart`). Icon collision hurts scanning. |
| 8 | "Organization" group is commented out but Warehouses live elsewhere | Top of `navGroups` | Either uncomment with a `Branches` item or remove the dead comment. |
| 9 | Three different "Dashboard" labels across groups | Insights, Procurement, HRM, Finance | Standardize to `{Group} Overview`. |
| 10 | Some groups grant `SUPPORT` access to Payments/Invoices | `Sales & CRM` group | Should be read-only / scoped permissions, not menu-level access. |

---

## 3. Structural Problems

### 3.1 "Sales & CRM" is overloaded and mislabeled
The group mixes Sales (Orders, POS, Returns, Payments, Invoices, Carts) and CRM (Customers, Live Chat). CRM has only one item, so the group name is misleading and there is no room for upcoming CRM features (segments, loyalty, wallet, AR).

### 3.2 POS placement
POS is an operational mode used by cashiers all day. It is buried under Sales. Most ERPs surface POS either at the top level (quick action) or in a dedicated **Retail / POS** group with Shifts, Registers, Cash Movements, Returns.

### 3.3 No first-class CRM / Loyalty / Wallet / AR menu
These are required to deliver the CRM/Loyalty plan in `doc/erp/CRM-LOYALTY-REQUIREMENTS.md` and they cannot live inside a single "Customers" page.

### 3.4 Inventory operations are too thin
Operations only shows Warehouses, Inventory, Fulfillment, Couriers, Expenses. Real WMS daily work also needs Stock Transfers, Stock Adjustments, Cycle Counts, Low-Stock Alerts.

### 3.5 Finance vs Reports overlap
P&L, Customer Ledger, Supplier Ledger, Cash Flow are accounting outputs. They belong under Finance. Reports should focus on analytical reporting and exports (sales trends, KPI dashboards, export center).

### 3.6 No collapsible groups
With 12+ top-level groups, the sidebar becomes a long scroll. Procurement, Finance, HRM, and Operations should be collapsible sub-menus to reduce cognitive load.

### 3.7 Role-permission mismatch
`Sales & CRM` allows `SUPPORT` to see Orders, Payments, Invoices, Returns. Fine for read access, but Payments/Invoices for a Support agent without finer permissions is risky.

### 3.8 Icon reuse
Customers, Suppliers, Supplier Ledger, Customer Ledger all use the `Users` icon. POS, Orders, Active Carts all use `ShoppingBag`. Visual scanning becomes harder.

### 3.9 "System Settings" mixes business and account config
"System Settings" contains business config (currencies, payment, courier, organization) alongside account config (subscription, billing). Account/billing should live in a separate small "Account" group near the bottom.

---

## 4. Target Sidebar Structure

The structure below keeps your existing routes when they exist and marks **(new)** for items not yet implemented.

```
INSIGHTS
  └ Overview                       /admin

RETAIL / POS                       (new group)
  └ Point of Sale                  /admin/pos
  └ Registers                      /admin/pos/registers       (new)
  └ Shifts                         /admin/pos/shifts          (new)
  └ Cash Movements                 /admin/pos/cash            (new)

SALES
  └ Orders                         /admin/orders
  └ Active Carts                   /admin/carts
  └ Returns                        /admin/returns
  └ Payments                       /admin/payments
  └ Invoices                       /admin/invoices

CRM & LOYALTY                      (new / renamed)
  └ Customers                      /admin/customers
  └ Customer 360 (id route)        /admin/customers/[id]      (new)
  └ Segments                       /admin/segments            (new)
  └ Loyalty Program                /admin/loyalty             (new)
  └ Wallet & Store Credit          /admin/wallet              (new)
  └ Referrals                      /admin/referrals           (new)
  └ Live Chat / Support            /admin/support
  └ Leads                          /admin/leads
  └ Subscribers                    /admin/subscribers

CATALOG
  └ Products                       /admin/products
  └ Categories                     /admin/categories
  └ Brands                         /admin/brands
  └ Price Books                    /admin/price-books         (new)
  └ Media                          /admin/media
  └ Reviews                        /admin/reviews

PROCUREMENT
  └ Overview                       /admin/procurement/dashboard
  └ Suppliers                      /admin/procurement/suppliers
  └ Requisitions                   /admin/procurement/requisitions
  └ RFQ / Quotations               /admin/procurement/rfq          (new)
  └ Purchase Orders                /admin/procurement/purchases
  └ Goods Received (GRN)           /admin/procurement/grn
  └ Supplier Invoices              /admin/procurement/invoices     (new)
  └ Debit Notes                    /admin/procurement/debit-notes  (new)
  └ Supplier Payments              /admin/procurement/payments     (new)

OPERATIONS / WMS
  └ Branches                       /admin/branches
  └ Warehouses                     /admin/warehouses
  └ Inventory (on-hand)            /admin/inventory
  └ Stock Adjustments              /admin/inventory/adjustments    (new)
  └ Stock Transfers                /admin/inventory/transfers      (new)
  └ Cycle Counts                   /admin/inventory/cycle-counts   (new)
  └ Fulfillment                    /admin/fulfillment
  └ Couriers                       /admin/couriers

FINANCE
  └ Overview                       /admin/finance
  └ Chart of Accounts              /admin/finance/coa              (new)
  └ Journal / General Ledger       /admin/finance/ledger
  └ Profit & Loss                  /admin/finance/profit-loss
  └ Balance Sheet                  /admin/finance/balance-sheet
  └ Cash Flow                      /admin/finance/cash-flow
  └ Accounts Receivable / Aging    /admin/finance/ar               (new)
  └ Accounts Payable / Aging       /admin/finance/ap               (new)
  └ Customer Ledger                /admin/finance/customer-ledger
  └ Supplier Ledger                /admin/finance/supplier-ledger
  └ Tax / VAT                      /admin/finance/tax              (new)
  └ Expenses                       /admin/expenses
  └ Fiscal Periods                 /admin/finance/periods          (new)

HUMAN RESOURCES
  └ Overview                       /admin/hrm/dashboard
  └ Employees                      /admin/hrm/employees
  └ Departments                    /admin/hrm/departments
  └ Designations                   /admin/hrm/designations
  └ Shifts                         /admin/hrm/shifts
  └ Attendance                     /admin/hrm/attendance
  └ Leaves                         /admin/hrm/leaves
  └ Recruitment                    /admin/hrm/recruitment
  └ Payroll                        /admin/hrm/payroll
  └ Performance                    /admin/hrm/performance          (new)

MARKETING
  └ Coupons                        /admin/coupons
  └ Promotions                     /admin/promotions
  └ Campaigns                      /admin/campaigns
  └ Automations (lifecycle)        /admin/marketing/automations    (new)

REPORTS & ANALYTICS
  └ Sales Analysis                 /admin/reports/sales
  └ Finance Summary                /admin/reports/finance
  └ Inventory KPIs                 /admin/reports/inventory        (new)
  └ Loyalty KPIs                   /admin/reports/loyalty          (new)
  └ HR KPIs                        /admin/reports/hr               (new)
  └ Export Center                  /admin/reports/export

ACCESS CONTROL
  └ Staff Accounts                 /admin/team
  └ Roles & Permissions            /admin/roles
  └ Audit Logs                     /admin/audit-logs

STOREFRONT & UI
  └ Pages Builder                  /admin/pages
  └ FAQs                           /admin/faqs
  └ Navbar / Footer / Product UI / Offers UI  (existing UI settings)

SYSTEM
  └ General Info / Domain / Currencies / Social / Trust / SEO / Labels / Organization
  └ Integrations: Email / SMS / Payment / Courier / System

ACCOUNT (near bottom)
  └ My Profile                     /admin/profile
  └ Subscription & Billing         /admin/settings/billing
```

---

## 5. Role-to-Group Visibility Matrix

| Group | ADMIN | STORE_MANAGER | OPERATOR | SUPPORT | MARKETING | CASHIER (new) | HR_MANAGER (new) | ACCOUNTANT (new) | SUPER_ADMIN |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| Insights | x | x | x | x (limited) | x (limited) | x (limited) | x (limited) | x | x |
| Retail / POS | x | x | x |  |  | x |  |  | x |
| Sales | x | x | x | x (read) |  | x (own) |  | x (read) | x |
| CRM & Loyalty | x | x | x (limited) | x | x (read) |  |  | x (AR only) | x |
| Catalog | x | x | x |  | x |  |  |  | x |
| Procurement | x | x | x |  |  |  |  | x (read) | x |
| Operations / WMS | x | x | x |  |  |  |  |  | x |
| Finance | x | x (limited) |  |  |  |  |  | x | x |
| HRM | x | x |  |  |  |  | x |  | x |
| Marketing | x | x |  |  | x |  |  |  | x |
| Reports | x | x (scope) |  |  |  |  |  | x | x |
| Access Control | x | x (limited) |  |  |  |  |  |  | x |
| Storefront & UI | x | x |  |  | x |  |  |  | x |
| System | x |  |  |  |  |  |  |  | x |
| Account | all roles see only their own profile |  |  |  |  |  |  |  |  |

---

## 6. Recommended `feature` Gate Naming Convention

Use a stable, hierarchical convention so RBAC and subscription gating both work:

- Per page: `/admin/<area>/<page>` (e.g. `/admin/hrm/payroll`, `/admin/finance/ar`).
- Per group landing: `/admin/<area>` (e.g. `/admin/hrm`).
- Use the **page-level** gate on each sidebar item, even if you also keep group-level gates for legacy compatibility.

This fixes the current HRM problem where every item shares `/admin/hrm` and access is all-or-nothing.

---

## 7. Quick Wins (Do These First)

1. Fix the POS `feature` gate to `/admin/pos`.
2. Add `feature` to Live Chat (`/admin/support`).
3. Split HRM gates per page.
4. Move Customer Ledger, Supplier Ledger, Cash Flow, and P&L from Reports to Finance (or link).
5. Rename "Sales & CRM" to "Sales" and create a new "CRM & Loyalty" group.
6. Use distinct icons for Customers vs Suppliers vs Ledger items, and for POS vs Orders vs Carts.
7. Standardize all group landing labels to `{Group} Overview`.
8. Make groups collapsible.
9. Add a "Quick Create" affordance in the topbar (new order, product, customer, PO).
10. Show current role + branch hint at the top of the sidebar.

---

## 8. Future Improvements

- **Persona-driven sidebars.** A cashier should not see Finance or HR. Use the role-to-group matrix above to filter `navGroups` at runtime.
- **Quick search across nav.** Use the existing topbar search to also index menu items, so users can jump by label.
- **Pinned items.** Allow each user to pin 3-5 frequently used pages above all groups.
- **Recently visited.** Show the last 3 visited admin pages in a compact pinned section.
- **Notifications shortcut.** A dedicated "Activity / Notifications" entry near the topbar avatar, not in the sidebar.
- **Telemetry.** Count clicks per item; archive items nobody clicks within 30 days.

---

## 9. Implementation Notes

When applying this proposal:

1. Keep all existing routes working. Add new routes incrementally rather than renaming legacy ones.
2. Each new sidebar entry must come with:
   - a real page or a "Coming Soon" stub that respects the feature gate,
   - matching backend route (if needed),
   - explicit RBAC permission(s) and audit logging.
3. Update `getFeatureDisplay()` in `client/routes.ts` so breadcrumbs and topbar titles continue to work.
4. Update `SUBSCRIPTION_TIERS.md` and feature flag tables — many of the new items (Loyalty, Wallet, AR, Cycle Counts) are good upsell candidates.
5. Add tests that assert "user with role X sees groups Y" to prevent accidental access leaks when nav changes.

---

## 10. Definition of Done

- All bugs in Section 2 are fixed.
- Sidebar reflects the structure in Section 4 (existing items moved; new items added as stubs at minimum).
- Role-to-group filtering matches the matrix in Section 5.
- Every sidebar item has a unique, page-level `feature` value.
- Groups are collapsible.
- Topbar has "Quick Create" and shows current role + branch.
- Telemetry logs sidebar clicks per item.

---

*This proposal is based on a static review of `client/routes.ts` and the rest of the codebase as of 2026-05-20.*
