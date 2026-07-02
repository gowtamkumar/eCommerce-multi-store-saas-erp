# Codebase Understanding — Master Index

**Purpose:** Every module, feature, and service in the `server/src/` codebase is documented here so that any developer or engineer can understand the system end-to-end without reading source code line-by-line.

**How to use:** Find the module or domain you are working on in the table below and open the corresponding document.

---

## Quick Server Structure Reference

```
server/src/
├── common/                        # Shared utilities (guards, decorators, DTOs, enums)
└── modules/
    ├── system/                    # Platform-level system services
    │   ├── store/                # Store onboarding & configuration
    │   ├── organization/          # Branches, warehouses, bins
    │   ├── audit-log/             # Append-only global audit trail
    │   ├── subscription-plan/     # SaaS billing plans
    │   ├── subscription-billing/  # Billing lifecycle management
    │   ├── platform/              # Super-admin platform controls
    │   └── super-admin/           # Super-admin specific routes
    ├── admin/                     # Store backoffice (ERP core)
    │   ├── core/
    │   │   ├── auth/              # JWT authentication, OTP
    │   │   ├── rbac/              # Role & permission management
    │   │   └── user/              # Staff user profiles
    │   ├── catalog/
    │   │   ├── product/           # Products, variants, attributes
    │   │   ├── category/          # Nested category tree
    │   │   ├── brand/             # Brand master
    │   │   ├── pricing/           # Price books and multi-tier pricing
    │   │   └── review/            # Product reviews
    │   ├── sales/
    │   │   ├── order/             # Online & admin-created orders
    │   │   ├── pos/               # POS registers, shifts, offline sync
    │   │   ├── cart/              # Checkout cart management
    │   │   ├── coupon/            # Coupon validation
    │   │   ├── payment/           # Payment allocation records
    │   │   └── promotion/         # Campaign & promotion strategies
    │   ├── operations/
    │   │   ├── finance/
    │   │   │   ├── accounting/    # GL, COA, journals, AR, tax, wallet
    │   │   │   ├── purchase/      # PO, GRN, supplier invoices, payments
    │   │   │   ├── expense/       # Business expense tracking
    │   │   │   ├── supplier/      # Supplier master records
    │   │   │   ├── invoice/       # Sales invoices
    │   │   │   └── report/        # Financial & operational reports
    │   │   ├── hrm/               # Employees, attendance, payroll, recruitment
    │   │   ├── logistics/
    │   │   │   ├── inventory-transaction/  # Ledger, reservations, transfers
    │   │   │   ├── grn/           # Goods Received Notes
    │   │   │   ├── fulfillment/   # Pick-pack-ship workflows
    │   │   │   └── courier/       # Courier API integrations
    │   │   └── infra/
    │   │       ├── cache/         # Redis store-scoped caching
    │   │       ├── chat/          # Live support chat (Socket.IO)
    │   │       ├── file/          # File & media upload (S3)
    │   │       ├── mail/          # Transactional email service
    │   │       ├── notification/  # In-app real-time notifications
    │   │       ├── push/          # Mobile FCM push notifications
    │   │       ├── queue/         # BullMQ queue registration
    │   │       └── sms/           # SMS delivery
    │   ├── customer/
    │   │   ├── lead/              # Sales lead pipeline
    │   │   └── subscriber/        # Newsletter subscribers
    │   ├── marketing/
    │   │   ├── campaign/          # Promotions & discount campaigns
    │   │   └── loyalty/           # Points & rewards engine
    │   ├── content/
    │   │   ├── page/              # Custom content pages
    │   │   └── faq/               # FAQ sections
    │   └── settings/              # Site settings (theme, branding, currency)
    └── store/                     # Storefront customer-facing APIs
        ├── cart/                  # Shopping cart
        ├── wishlist/              # Saved products
        ├── shipping-address/      # Delivery address book
        └── wallet/                # Store credit (read-only for customer)
```

---

## Document Index

| # | Document | Domains Covered |
| :-- | :--- | :--- |
| 01 | [`01_system_infrastructure.md`](01_system_infrastructure.md) | Store, Subscription, Organization (Branch/Warehouse), Audit Log |
| 02 | [`02_catalog_and_marketing.md`](02_catalog_and_marketing.md) | Products, Variants, Categories, Brands, Price Books, Loyalty, Campaigns, Site Settings |
| 03 | [`03_sales_and_pos.md`](03_sales_and_pos.md) | Orders, Returns, POS Registers, Cashier Shifts, Cash Drawer, Coupons, Promotions |
| 04 | [`04_logistics_and_inventory.md`](04_logistics_and_inventory.md) | Inventory Ledger, Batch/Expiry Lots, Stock Reservations, Transfers, GRN, Fulfillment, Courier |
| 05 | [`05_finance_and_procurement.md`](05_finance_and_procurement.md) | Chart of Accounts, GL Journals, AP (Purchase Orders, Supplier Invoices, Payments, 3-Way Match) |
| 06 | [`06_hrm_module.md`](06_hrm_module.md) | Employees, Attendance, Leave Quotas, Payroll Batches, Payslips, GL Integration, Recruitment, Performance Reviews |
| 07 | [`07_auth_and_rbac.md`](07_auth_and_rbac.md) | JWT Auth, Roles, Permissions, User-Role Scope Assignment, Permission Overrides, Guard Chain |
| 08 | [`08_finance_reporting_and_tax.md`](08_finance_reporting_and_tax.md) | P&L, Balance Sheet, Cash Flow, Trial Balance, VAT/Tax Engine, AR Dunning, Operational Reports |
| 09 | [`09_infrastructure_services.md`](09_infrastructure_services.md) | Redis Cache, BullMQ Queues, File Uploads (S3), Mail, Chat (Socket.IO), In-App Notifications, Push (FCM), SMS |
| 10 | [`10_customer_crm_and_storefront.md`](10_customer_crm_and_storefront.md) | Customer Profiles, Wallet/AR/Loyalty Ledgers, Lead Pipeline, Storefront Cart, Wishlist, Shipping Addresses |

---

## Key Architectural Principles (Quick Reference)

> Every developer working on this codebase must internalize these rules before writing code.

| Rule | Why it exists |
| :--- | :--- |
| **Every query must scope by `storeId`** | Prevents cross-store data leaks |
| **No direct stock number updates** | Race conditions destroy audit accuracy — use the inventory ledger |
| **Never UPDATE or DELETE journal entries** | GAAP compliance — use reversal journals |
| **Read `storeId` from `ctx` (JWT), never from request body** | Prevents injection attacks |
| **All cross-domain writes go through the owning Service** | Prevents spaghetti coupling between modules |
| **All async side effects go through BullMQ or EventEmitter** | Keeps HTTP threads fast and non-blocking |
| **Cache keys always start with `t:{storeId}:`** | Guarantees store isolation in Redis |
| **Payroll / Inventory Adjustments require approval before GL posting** | Prevents accidental financial mutations |
| **Offline POS sales use `clientSaleId` for idempotency** | Prevents duplicate transactions on reconnect |
| **Subscription feature gates use `@RequireFeature()` decorator** | Centralises plan gating logic |

---

## How to Add a New Module (Checklist)

Follow these steps in order. Skipping any step creates technical debt.

- [ ] **1. Entity** — Create the TypeORM entity with `storeId`, composite indexes, and soft-delete
- [ ] **2. Repository** — Create a scoped repository that always filters by `ctx.storeId`
- [ ] **3. Service** — Implement business logic; wrap multi-table operations in `dataSource.transaction()`
- [ ] **4. Controller** — Apply `@UseGuards(JwtAuthGuard, SubscriptionGuard, PermissionsGuard)` and relevant decorators
- [ ] **5. Module** — Register entity, controller, service, and repository; export service if consumed elsewhere
- [ ] **6. Migration** — Generate a TypeORM migration; never rely on `synchronize: true` in production
- [ ] **7. Seed** — Add permission codes to the permissions seed script if the module needs RBAC
- [ ] **8. Tests** — Write integration tests including cross-store isolation assertions
- [ ] **9. Documentation** — Add an entry to this index and create a codebase understanding doc

---

*For the full ERP documentation index, see [`../README.md`](../README.md).*
