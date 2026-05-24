# Codebase Understanding — System Infrastructure Modules

This document provides a verified, field-accurate breakdown of the core system infrastructure modules based on the actual TypeScript source code.

---

## Module Locations

```
server/src/modules/system/
├── tenant/                           # Tenant configuration & lifecycle
│   ├── entities/
│   │   ├── tenant.entity.ts          # Core tenant record
│   │   └── tenant-feature.entity.ts  # Per-tenant feature flag overrides
│   ├── tenant.service.ts             # Onboarding, domain verification, billing lifecycle
│   ├── tenant.repository.ts          # Scoped DB access
│   ├── tenant.controller.ts          # Admin-level tenant management endpoints
│   ├── public-tenant.controller.ts   # Public guest store lookup by subdomain
│   └── tenant.module.ts
├── organization/                     # Branch & Warehouse hierarchy
│   ├── entities/
│   │   ├── branch.entity.ts
│   │   ├── warehouse.entity.ts
│   │   └── warehouse-bin.entity.ts
│   ├── services/
│   ├── repositories/
│   └── organization.module.ts
├── audit-log/                        # Global append-only event log
│   ├── entities/audit-log.entity.ts
│   ├── audit-log.service.ts
│   ├── audit-log.repository.ts
│   └── audit-log.controller.ts
├── subscription-plan/                # SaaS plan definitions
├── subscription-billing/             # Billing lifecycle
├── platform/                         # Super-admin platform controls
└── super-admin/
```

---

## 1. Tenant Domain (`tenant/entities/tenant.entity.ts`)

> **Verified from source**

| Field | Type | Notes |
| :--- | :--- | :--- |
| `storeName` | VARCHAR | Name of the tenant store |
| `subdomain` | VARCHAR (UNIQUE) | e.g. `mystore.platform.com` |
| `customDomain` | VARCHAR (UNIQUE, nullable) | Custom domain mapping |
| `customDomainStatus` | ENUM `CustomDomainStatus` | PENDING, VERIFIED, FAILED |
| `customDomainVerifiedAt` | TIMESTAMPTZ (nullable) | When DNS was confirmed |
| `sslEnabled` | BOOLEAN (default false) | SSL certificate status |
| `status` | ENUM `TenantStatus` | ACTIVE, SUSPENDED, DELETED |
| `subscriptionPlanId` | UUID FK → `SubscriptionPlanEntity` | Active plan |
| `subscriptionBillingCycle` | ENUM `SubscriptionBillingCycle` | MONTHLY, YEARLY |
| `subscriptionStatus` | ENUM `SubscriptionStatus` | ACTIVE, TRIAL, EXPIRED, CANCELLED |
| `subscriptionStartsAt` | TIMESTAMPTZ | Plan start date |
| `subscriptionEndsAt` | TIMESTAMPTZ | Plan expiry date |
| `userId` | UUID FK → `UserEntity` | Tenant owner/admin user |

> **Computed property:** `get isExpired()` returns `true` when `new Date() > subscriptionEndsAt`

### Key Services
- **`TenantService`:** Handles tenant registration, plan changes, custom domain DNS verification, and subscription state transitions.
- **`PublicTenantController`:** Guest-accessible endpoint to look up store theme and settings by subdomain (used by the Next.js storefront SSR).

### API Endpoints
| Method | Path | Description |
| :--- | :--- | :--- |
| `GET` | `/api/system/tenants` | List all tenants (Super-admin) |
| `POST` | `/api/system/tenants/onboard` | Register a new tenant |
| `POST` | `/api/system/tenants/domain` | Request custom domain verification |
| `GET` | `/api/public/tenant/:subdomain` | Guest lookup for store config |

---

## 2. Organization Domain

Located at: `server/src/modules/system/organization/entities/`

### `BranchEntity` (`branch.entity.ts`)
Represents a physical or logical business location.

| Field | Type | Notes |
| :--- | :--- | :--- |
| `tenantId` | UUID FK | Strict tenant isolation |
| `name` | VARCHAR | Branch display name |
| `address` | TEXT | Physical address |
| `contactPhone` | VARCHAR (nullable) | Branch contact |
| `isActive` | BOOLEAN | Enable/disable branch operations |

### `WarehouseEntity` (`warehouse.entity.ts`)
Defines a stock-holding location.

| Field | Type | Notes |
| :--- | :--- | :--- |
| `tenantId` | UUID FK | Strict tenant isolation |
| `name` | VARCHAR | Warehouse label |
| `address` | TEXT | Physical location |
| `branchId` | UUID FK (nullable) | If null → central/shared warehouse |
| `isActive` | BOOLEAN | Enable/disable |

### `WarehouseBinEntity` (`warehouse-bin.entity.ts`)
Bin/rack subdivisions inside a warehouse.

| Field | Type | Notes |
| :--- | :--- | :--- |
| `warehouseId` | UUID FK | Parent warehouse |
| `zone` | VARCHAR | Zone label (e.g. `Zone-A`) |
| `binCode` | VARCHAR | Bin identifier (e.g. `A-01-05`) |

---

## 3. Audit Log Domain

Located at: `server/src/modules/system/audit-log/`

### `AuditLogEntity` (`entities/audit-log.entity.ts`)
Append-only immutable log of every system mutation.

| Field | Type | Notes |
| :--- | :--- | :--- |
| `tenantId` | UUID | Tenant scope |
| `userId` | UUID | Who performed the action |
| `action` | VARCHAR | e.g. `order.create`, `stock.adjust` |
| `resourceType` | VARCHAR | e.g. `ORDER`, `PRODUCT`, `EMPLOYEE` |
| `resourceId` | UUID | The affected record |
| `payload` | JSONB | Before/after state snapshot |
| `ipAddress` | VARCHAR | Client IP for security audits |

### Services
- **`AuditLogService`:** Exposes `log(ctx, action, resource)` used by interceptors and high-risk service methods.
- **`AuditLogController`:** Allows tenant admins and super-admins to search, filter by user/action/date, and export audit trails.
