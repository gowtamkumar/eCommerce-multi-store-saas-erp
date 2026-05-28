# Subscription Plan & Feature Access Control — System Design

> **Audience**: Backend and full-stack developers joining or reviewing this project.  
> **Goal**: Give a complete, end-to-end understanding of how subscription plans, feature gating, and fine-grained permission control work together in this multi-tenant SaaS platform.

---

## Table of Contents

1. [Overview](#overview)
2. [Core Concepts & Glossary](#core-concepts--glossary)
3. [Database Schema](#database-schema)
4. [Entity Relationship Diagram](#entity-relationship-diagram)
5. [The 3-Step Permission Resolution Algorithm](#the-3-step-permission-resolution-algorithm)
6. [Guard Pipeline — Request Lifecycle](#guard-pipeline--request-lifecycle)
7. [Feature Catalog & Slugs](#feature-catalog--slugs)
8. [Subscription Plans (`subscription_plans`)](#subscription-plans-subscription_plans)
9. [Role & Permission System (RBAC)](#role--permission-system-rbac)
10. [User Permission Overrides (Excluded from Resolution)](#user-permission-overrides-excluded-from-resolution)
11. [Permission Manifest (Login Cache)](#permission-manifest-login-cache)
12. [Frontend Feature Gating](#frontend-feature-gating)
13. [Key Invariants & Rules](#key-invariants--rules)
14. [Common Scenarios — Decision Tree](#common-scenarios--decision-tree)
15. [File Reference Map](#file-reference-map)

---

## Overview

This platform serves multiple independent **tenants** (stores), each on a **subscription plan**. Access to features and fine-grained operations is controlled by a tiered resolution model:

```
Layer 1a: Subscription Plan   →  Does this tenant's plan include the feature?
Layer 1b: Tenant Overrides    →  Is there an explicit override in the database (custom add-on or block)?
Layer 2:  RBAC (Roles)        →  Does this user's role grant the specific action within the enabled feature?
```

Every API request passes through this stack in order. A **DENY at any layer is final** — a user cannot access a feature unless it is enabled via their plan or explicitly overridden as enabled, and their role grants it.


---

## Core Concepts & Glossary

| Term | Definition |
|---|---|
| **Tenant** | An independent store with its own data, users, and configuration. Identified by `tenantId` (UUID). |
| **Subscription Plan** | A tiered product offering (e.g. Starter, Pro, Enterprise) that defines which **features** are included. |
| **Feature** | A functional area of the application (e.g. `payroll`, `pos`, `inventory`). Identified by a **slug** string. |
| **Feature Slug** | A lowercase string like `payroll`, `pos`, `hrm`. Canonical ID for a feature across all layers. |
| **Permission** | An atomic capability within a feature. Format: `feature:action` (e.g. `payroll:approve`, `pos:refund`). |
| **Role** | A named collection of permissions. Assigned to users within a tenant scope. |
| **Permission Manifest** | A cached JSON blob returned at login listing all `featuresEnabled` and `permissions` for a user. |
| **Super Admin** | A platform-level user (`UserRole.SUPER_ADMIN`) who bypasses ALL feature and permission checks. |

---

## Database Schema

### `subscription_plans`

The central catalog of available subscription tiers created by the platform.

```sql
CREATE TABLE subscription_plans (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                    VARCHAR(255) NOT NULL,            -- "Starter", "Pro", "Enterprise"
  description             TEXT,
  price                   DECIMAL(10,2) DEFAULT 0,
  monthly_price           DECIMAL(10,2) DEFAULT 0,
  yearly_price            DECIMAL(10,2) DEFAULT 0,
  billing_cycle           ENUM('monthly','yearly') DEFAULT 'monthly',
  features                JSONB DEFAULT '[]',               -- ← Array of feature slugs: ["pos","inventory","payroll"]
  is_active               BOOLEAN DEFAULT true,
  is_popular              BOOLEAN DEFAULT false,
  trial_period_days       INT DEFAULT 14,
  code                    VARCHAR UNIQUE,                   -- Short code: "starter", "pro", "enterprise"
  currency                VARCHAR(3) DEFAULT 'USD',
  max_branches            INT DEFAULT 1,
  max_warehouses          INT DEFAULT 1,
  max_staff_users         INT DEFAULT 3,
  max_products            INT DEFAULT 100,
  max_monthly_orders      INT DEFAULT 500,
  max_storage_mb          INT DEFAULT 1024,
  stripe_price_id_monthly VARCHAR,
  stripe_price_id_yearly  VARCHAR,
  created_at              TIMESTAMPTZ DEFAULT now(),
  updated_at              TIMESTAMPTZ DEFAULT now()
);
```

> **Key field**: `features JSONB` stores an **array of feature slugs** that this plan includes.  
> Example: `["pos", "inventory", "loyalty", "crm"]`

---

### `tenants`

Each tenant (store) subscribes to exactly one plan.

```sql
CREATE TABLE tenants (
  id                       UUID PRIMARY KEY,
  store_name               VARCHAR NOT NULL,
  subdomain                VARCHAR UNIQUE NOT NULL,
  custom_domain            VARCHAR UNIQUE,
  custom_domain_status     ENUM('pending','verified','failed') DEFAULT 'pending',
  status                   ENUM('active','suspended','inactive','maintenance') DEFAULT 'active',
  ssl_enabled              BOOLEAN DEFAULT false,
  -- ─── Subscription ───────────────────────────────────────
  subscription_plan_id     UUID REFERENCES subscription_plans(id),
  subscription_billing_cycle ENUM('monthly','yearly') DEFAULT 'monthly',
  subscription_status      ENUM('trial','active','past_due','canceled','expired') DEFAULT 'active',
  subscription_starts_at   TIMESTAMPTZ,
  subscription_ends_at     TIMESTAMPTZ,
  -- ─── Ownership ──────────────────────────────────────────
  user_id                  UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at               TIMESTAMPTZ DEFAULT now(),
  updated_at               TIMESTAMPTZ DEFAULT now()
);
```

---

### `tenant_features`

Stores explicit per-tenant feature overrides (add-ons or disabling a plan feature) configured by the platform super-admin.

```sql
CREATE TABLE tenant_features (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id    UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  feature_slug VARCHAR(100) NOT NULL,
  is_enabled   BOOLEAN DEFAULT true,
  enabled_by   UUID,
  enabled_at   TIMESTAMPTZ,
  created_at   TIMESTAMPTZ DEFAULT now(),
  updated_at   TIMESTAMPTZ DEFAULT now(),
  UNIQUE (tenant_id, feature_slug)
);
```

---


### `permissions`

Atomic capabilities in the system. Platform-owned and seeded. Format: `feature:action`.

```sql
CREATE TABLE permissions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code        VARCHAR UNIQUE NOT NULL,     -- "payroll:approve", "pos:refund"
  name        VARCHAR NOT NULL,
  description VARCHAR,
  module      VARCHAR NOT NULL,            -- Grouping label: "Finance", "POS", "HRM"
  feature     VARCHAR(100),               -- Parent feature slug: "payroll", "pos"
  action      VARCHAR(100),               -- The action: "approve", "refund", "delete"
  risk_level  ENUM('low','medium','high','critical') DEFAULT 'low'
);
```

---

### `roles`

Named collections of permissions scoped to a tenant.

```sql
CREATE TABLE roles (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name              VARCHAR(255) NOT NULL,
  description       TEXT,
  tenant_id         UUID REFERENCES tenants(id) ON DELETE CASCADE,
  is_system_role    BOOLEAN DEFAULT false,    -- Immutable platform-provisioned roles
  is_system_default BOOLEAN DEFAULT false,    -- @deprecated use is_system_role
  UNIQUE (name, tenant_id)
);

-- Junction table for role ↔ permission many-to-many
CREATE TABLE role_permissions (
  role_id       UUID REFERENCES roles(id) ON DELETE CASCADE,
  permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);
```

> **Flat Roles**: Roles are flat with no inheritance (the `parent_role_id` column has been removed). Multiple roles can be assigned to a user, and their permissions are unioned.

---

### `user_role_assignments`

Associates a user with a role, optionally scoped to a branch or warehouse.

```sql
CREATE TABLE user_role_assignments (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_id     UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  scope_type  ENUM('global','branch','warehouse') DEFAULT 'global',
  scope_id    UUID,             -- Branch or warehouse UUID (NULL when scope_type = 'global')
  assigned_by UUID,
  expires_at  TIMESTAMPTZ,     -- NULL = permanent; otherwise auto-expires
  assigned_at TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, role_id, scope_id)
);
```

> **Note on Scope**: The `scope_type` and `scope_id` columns are kept for future branch/warehouse scoping capabilities. The current permission resolution engine treats all assignments as GLOBAL (tenant-wide).

---

### `user_permission_overrides`

Per-user explicit ALLOW or DENY for a specific permission.

```sql
CREATE TABLE user_permission_overrides (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  permission_slug VARCHAR(150) NOT NULL,    -- "payroll:approve"
  effect          ENUM('allow','deny') DEFAULT 'allow',
  reason          TEXT,                     -- Required for audit trail
  override_by     UUID,                     -- Admin who set this override
  expires_at      TIMESTAMPTZ,             -- Auto-expiry; NULL = permanent
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);
```

> **⚠️ Performance/Design Note**: Overrides are kept in the schema and REST API endpoints for user convenience or future use, but are **excluded from the active permission resolution hot path** to optimize performance.

---

## Entity Relationship Diagram

```mermaid
erDiagram
    subscription_plans {
        uuid id PK
        varchar name
        jsonb features "['pos','payroll','inventory']"
        decimal monthly_price
        decimal yearly_price
        int max_branches
        int max_staff_users
        varchar stripe_price_id_monthly
    }

    tenants {
        uuid id PK
        varchar store_name
        varchar subdomain
        uuid subscription_plan_id FK
        enum subscription_status
        timestamptz subscription_ends_at
    }

    tenant_features {
        uuid id PK
        uuid tenant_id FK
        varchar feature_slug
        boolean is_enabled
    }

    roles {
        uuid id PK
        varchar name
        uuid tenant_id FK
        boolean is_system_role
    }

    permissions {
        uuid id PK
        varchar code "UNIQUE 'payroll:approve'"
        varchar feature "payroll"
        varchar action "approve"
        enum risk_level
    }

    role_permissions {
        uuid role_id FK
        uuid permission_id FK
    }

    users {
        uuid id PK
        uuid tenant_id FK
        varchar email
        enum role "super_admin|admin|staff"
    }

    user_role_assignments {
        uuid id PK
        uuid user_id FK
        uuid role_id FK
        uuid tenant_id FK
        enum scope_type "global|branch|warehouse"
        uuid scope_id "nullable"
        timestamptz expires_at "nullable"
    }

    user_permission_overrides {
        uuid id PK
        uuid user_id FK
        uuid tenant_id FK
        varchar permission_slug
        enum effect "allow|deny"
        timestamptz expires_at "nullable"
    }

    subscription_plans ||--o{ tenants : "subscribed by"
    tenants ||--o{ roles : "owns"
    tenants ||--o{ tenant_features : "has overrides"
    roles ||--o{ role_permissions : "has"
    permissions ||--o{ role_permissions : "assigned to"
    users ||--o{ user_role_assignments : "has"
    roles ||--o{ user_role_assignments : "assigned via"
    users ||--o{ user_permission_overrides : "has"
    tenants ||--o{ users : "contains"
```

---

## The 3-Step Permission Resolution Algorithm

The `PermissionResolutionService` implements this decision tree for every protected API call:

```mermaid
flowchart TD
    A([API Request: user=U, tenant=T, permission=F:A]) --> B{Is Super Admin?}
    B -- Yes --> ALLOW([✅ ALLOW])
    B -- No --> C[Extract feature slug from permission\ne.g. 'payroll' from 'payroll:approve']

    C --> D{Step 1: Check override in tenant_features}
    D -- Found Override: enabled --> E
    D -- Found Override: disabled --> DENY1([❌ DENY — Disabled by Admin])
    D -- No Override --> D2{Fallback: Is slug in subscription plan?}
    D2 -- No --> DENY2([❌ DENY — Upgrade plan])
    D2 -- Yes --> E

    E[Step 2: Collect all active\nnon-expired role assignments\nfor user U in tenant T]
    E --> F[Gather permissions\nfrom flat roles]
    F --> G{Step 3: Does permission\nset include F:A?}
    G -- Yes --> ALLOW2([✅ ALLOW])
    G -- No --> DENY3([❌ DENY])
```

### Step-by-Step Breakdown

| Step | Logic | Source |
|---|---|---|
| **0** | **Super Admin bypass**: `UserRole.SUPER_ADMIN` skips all checks | `permissions.guard.ts` |
| **1** | **Feature enabled for tenant?**: Checks `tenant_features` database overrides. If no override exists, falls back to checking `subscription_plans.features[]`. | `permission-resolution.service.ts → isFeatureEnabledForTenant()` |
| **2** | **Role collection (Flat)**: Collect all active, non-expired role assignments for the user in this tenant (no inheritance chain) and union their permissions | `getEffectivePermissions()` |
| **3** | **Check permission**: Verify if the target permission slug exists in the collected set | `resolvePermission()` |

### Resolution Priority (Highest to Lowest)

```
Super Admin bypass
    ↓
Feature explicitly disabled via Tenant Override → DENY
    ↓
Feature explicitly enabled via Tenant Override (Add-on) → check RBAC roles
    ↓
Feature not in subscription plan (and no override) → DENY
    ↓
No role assignments grant permission → DENY
    ↓
Role-granted permission → ALLOW
```

> **Note on Direct User Permission Overrides**: The direct per-user permission overrides table `user_permission_overrides` is excluded from this evaluation flow to optimize performance and simplify the model.


---

## Guard Pipeline — Request Lifecycle

Every incoming HTTP request to a protected endpoint passes through this ordered guard chain:

```mermaid
sequenceDiagram
    participant Client
    participant MaintenanceGuard
    participant JwtAuthGuard
    participant TenantStatusGuard
    participant SubscriptionGuard
    participant PermissionsGuard
    participant Controller

    Client->>MaintenanceGuard: HTTP Request
    MaintenanceGuard-->>MaintenanceGuard: Is platform in maintenance mode?
    Note over MaintenanceGuard: Bypasses: auth routes, super admin, public

    MaintenanceGuard->>JwtAuthGuard: Pass
    JwtAuthGuard-->>JwtAuthGuard: Validate JWT, attach request.user
    Note over JwtAuthGuard: Returns 401 if invalid/missing token

    JwtAuthGuard->>TenantStatusGuard: request.user attached
    TenantStatusGuard-->>TenantStatusGuard: Is tenant active? Not suspended/expired?

    TenantStatusGuard->>SubscriptionGuard: Tenant is active
    SubscriptionGuard-->>SubscriptionGuard: @RequireFeature('payroll') present?
    Note over SubscriptionGuard: Checks plan features directly

    SubscriptionGuard->>PermissionsGuard: Feature is accessible
    PermissionsGuard-->>PermissionsGuard: @Permissions(['payroll:approve']) present?
    Note over PermissionsGuard: Runs 3-step resolution via PermissionResolutionService

    PermissionsGuard->>Controller: ✅ Access granted
    Controller->>Client: 200 Response
```

### Guard Responsibilities

| Guard | File | Responsibility |
|---|---|---|
| `MaintenanceGuard` | `guards/maintenance.guard.ts` | Blocks all traffic when `platform_settings.is_maintenance_mode = true` |
| `JwtAuthGuard` | `guards/jwt-auth.guard.ts` | Validates Bearer JWT, rejects if invalid or missing |
| `TenantStatusGuard` | `guards/tenant-status.guard.ts` | Ensures tenant is `active` and subscription is not `expired` |
| `SubscriptionGuard` | `guards/subscription.guard.ts` | Route-level feature check via `@RequireFeature('slug')` decorator |
| `PermissionsGuard` | `guards/permissions.guard.ts` | Per-permission check via `@Permissions(['feature:action'])` — runs the 3-step engine |

---

## Feature Catalog & Slugs

The platform supports the following core and add-on feature slugs, which are assigned to subscription plans and permission codes. There is no `feature_definitions` table in the database anymore; features are identified statically by their string slugs.

| Slug | Display Name | Tier | Description |
|---|---|---|---|
| `settings` | Store Settings | core | Configuration, subdomain settings, custom domains |
| `user-management` | User Management | core | Roles, permissions, and staff management |
| `audit-logs` | Audit Logs | core | System audit and activity trails |
| `pos` | Point of Sale | starter | Front-of-house register, daily checkout sessions |
| `inventory` | Inventory Management | starter | Products, variants, categories, price books |
| `ecommerce` | E-Commerce Store | starter | Web storefront, checkout integration |
| `crm` | CRM & Leads | pro | Customers, leads, marketing segmentations |
| `loyalty` | Loyalty & Rewards | pro | Reward points, tiers, coupon programs |
| `payroll` | Payroll | pro | Employee pay schedules, salary structures |
| `hrm` | Human Resources | pro | Department structures, staff assignments |
| `accounting` | Accounting & Finance | enterprise | Double-entry journals, accounts chart, tax setups |
| `reports` | Advanced Reports | enterprise | Advanced finance and fulfillment analytics |

---

## Subscription Plans (`subscription_plans`)

Plans define the feature set AND resource limits for a tenant:

### Example Plan Configurations

**Starter Plan**
```json
{
  "name": "Starter",
  "code": "starter",
  "monthly_price": 29.99,
  "features": ["pos", "inventory", "ecommerce"],
  "max_branches": 1,
  "max_staff_users": 5,
  "max_products": 500,
  "max_monthly_orders": 1000,
  "max_storage_mb": 2048
}
```

**Pro Plan**
```json
{
  "name": "Pro",
  "code": "pro",
  "monthly_price": 79.99,
  "features": ["pos", "inventory", "ecommerce", "crm", "loyalty", "payroll", "hrm"],
  "max_branches": 5,
  "max_staff_users": 25,
  "max_products": 5000,
  "max_monthly_orders": 10000,
  "max_storage_mb": 10240
}
```

**Enterprise Plan**
```json
{
  "name": "Enterprise",
  "code": "enterprise",
  "monthly_price": 199.99,
  "features": ["pos", "inventory", "ecommerce", "crm", "loyalty", "payroll", "hrm", "accounting", "reports"],
  "max_branches": -1,
  "max_staff_users": -1,
  "max_products": -1,
  "max_monthly_orders": -1,
  "max_storage_mb": -1
}
```

> `-1` for limits = unlimited.

---


---

## Role & Permission System (RBAC)

### Flat Roles

Roles do not support inheritance (the `parent_role_id` column has been removed). Permissions are managed by:
- Creating roles with specific target permissions.
- Assigning multiple flat roles to a single user.
- The resolution engine then automatically unions all permissions granted by their active roles.

### Scope Types

| Scope | Description | `scope_id` |
|---|---|---|
| `GLOBAL` | User acts across the entire tenant | `null` |
| `BRANCH` | User is restricted to a specific branch | `branchId` (UUID) |
| `WAREHOUSE` | User is restricted to a specific warehouse | `warehouseId` (UUID) |

> **Scope Evaluation**: The `scope_type` and `scope_id` columns are preserved on `user_role_assignments` for future multi-branch and multi-warehouse scoping features. Currently, the resolution engine treats all active assignments as GLOBAL (tenant-wide). A user can hold **multiple role assignments simultaneously**, and the resolution engine takes the union of all active roles.

### System Roles

System roles (`is_system_role = true`) are auto-provisioned when a tenant is created. They **cannot be modified or deleted** by the tenant admin. Examples:
- `Super Admin` (tenant-level super user)
- `Store Owner`

---

## User Permission Overrides (Excluded from Resolution)

Direct per-user permission overrides can be defined and managed via the `/rbac/users/:userId/overrides` REST endpoints. This is saved in the `user_permission_overrides` table.

```json
{
  "userId": "user-123",
  "tenantId": "tenant-456",
  "permissionSlug": "payroll:approve",
  "effect": "deny",
  "reason": "Temporary restriction pending compliance check",
  "overrideBy": "admin-789",
  "expiresAt": "2026-09-01T00:00:00Z"
}
```

> **⚠️ Excluded from Evaluation Hot Path**: Direct user permission overrides are **NOT** read or evaluated by the current `PermissionResolutionService`. The resolver determines permissions strictly based on active user-role assignments to optimize performance.

---

## Permission Manifest (Login Cache)

On login, the server generates and caches a **Permission Manifest** for the user. This is delivered to the frontend and used for **UI gating only** (showing/hiding menu items, buttons, etc.).

### Structure

```typescript
interface PermissionManifest {
  featuresEnabled: string[]   // ["pos", "inventory", "payroll"]
  permissions: string[]       // ["pos:view", "pos:create", "payroll:view", "payroll:approve"]
}
```

### How It's Built

```mermaid
flowchart LR
    subgraph Feature Resolution
        P[Plan features] --> FE[featuresEnabled]
    end

    subgraph Permission Resolution
        RA[Role assignments] --> UP[Union permissions]
        UP --> FF[Filter: only include perms\nwhere feature is in featuresEnabled]
        FF --> PERMS[permissions]
    end

    FE --> Manifest
    PERMS --> Manifest
    Manifest --> Cache[(Redis\nTTL: 5 min)]
    Cache --> Login[Login Response]
```

### Cache Key

```
rbac:manifest:{tenantId}:{userId}
```

**Cache is invalidated whenever**:
- A role is assigned or revoked
- A tenant's plan or feature overrides change

> ⚠️ **Security Warning**: The manifest is for UI convenience **only**. The backend always re-validates permissions on every request via `PermissionsGuard`. Never trust the manifest alone for access control decisions.

---

## Frontend Feature Gating

The client receives the manifest after login and stores it in the auth context. Components use it to conditionally render UI:

```typescript
// Check if a feature is enabled
const canAccessPayroll = featuresEnabled.includes('payroll')

// Check if a specific permission is granted
const canApprovePayroll = permissions.includes('payroll:approve')

// Navigation guard example
if (!featuresEnabled.includes('pos')) {
  redirect('/dashboard')
}
```

### Where It's Used

| Location | What it gates |
|---|---|
| Sidebar navigation | Show/hide menu sections (POS, Payroll, HRM) |
| Route guards (Next.js middleware) | Redirect if feature not in plan |
| Action buttons | Disable "Approve Payroll" if permission missing |
| Form fields | Hide admin-only fields from staff users |

---

## Key Invariants & Rules

1. **Feature first**: If a feature is not in the tenant's subscription plan, NO permission within that feature can be granted — regardless of role.
2. **Expired items are ignored, not deleted**: `user_role_assignments.expires_at` is checked at runtime. Cleanup is optional.
3. **Super Admin bypasses everything**: `UserRole.SUPER_ADMIN` skips the entire guard chain.
4. **Backend always re-validates**: The permission manifest is a hint for the UI. The backend runs the full resolution on every request.
5. **Permissions are platform-owned**: Tenants cannot invent new permissions. Only platform seeds them.
6. **Core features are indestructible**: Features with `is_core = true` are always enabled.

---

## Common Scenarios — Decision Tree

### Scenario A: User tries to access Payroll module but tenant is on Starter plan

```
Step 1: isFeatureEnabledForTenant('payroll')
  → Check plan.features = ['pos', 'inventory', 'ecommerce']
  → 'payroll' NOT in plan features
  → DENY ❌ (403: Upgrade your plan)
```

### Scenario C: User has Store Manager role (grants payroll:approve) but no other assignments

```
Step 1: Feature enabled ✅
Step 2: Collect roles → Found Store Manager
Step 3: Check permissions → Store Manager grants 'payroll:approve'
  → ALLOW ✅
```

---

## File Reference Map

| File | Role |
|---|---|
| [`subscription-plan.entity.ts`](../server/src/modules/system/subscription-plan/entities/subscription-plan.entity.ts) | Plan schema: `features` JSONB, pricing, limits |
| [`tenant.entity.ts`](../server/src/modules/system/tenant/entities/tenant.entity.ts) | Tenant schema: `subscriptionPlanId` FK, subscription status |
| [`tenant-feature.entity.ts`](../server/src/modules/system/tenant/entities/tenant-feature.entity.ts) | Tenant feature overrides schema: `tenantId`, `featureSlug`, `isEnabled` |
| [`permission.entity.ts`](../server/src/modules/admin/core/user/entities/permission.entity.ts) | Atomic permission: `code = 'feature:action'` |
| [`role.entity.ts`](../server/src/modules/admin/core/user/entities/role.entity.ts) | Role schema (flat, no inheritance) |
| [`user-role-assignment.entity.ts`](../server/src/modules/admin/core/user/entities/user-role-assignment.entity.ts) | User ↔ Role assignment with scope (kept for future use) and expiry |
| [`user-permission-override.entity.ts`](../server/src/modules/admin/core/user/entities/user-permission-override.entity.ts) | Direct ALLOW/DENY override per user (kept but excluded from resolution hot path) |
| [`permission-resolution.service.ts`](../server/src/common/services/permission-resolution.service.ts) | **Core engine**: 3-step resolution + manifest builder |
| [`permissions.guard.ts`](../server/src/common/guards/permissions.guard.ts) | Guard that calls resolution service per request |
| [`subscription.guard.ts`](../server/src/common/guards/subscription.guard.ts) | Route-level feature check via `@RequireFeature` |
| [`maintenance.guard.ts`](../server/src/common/guards/maintenance.guard.ts) | Platform-wide maintenance mode gate |
| [`tenant-status.guard.ts`](../server/src/common/guards/tenant-status.guard.ts) | Checks tenant is active and not suspended/expired |
| [`require-feature.decorator.ts`](../server/src/common/decorators/require-feature.decorator.ts) | `@RequireFeature('slug')` route decorator |
| [`permissions.decorator.ts`](../server/src/common/decorators/permissions.decorator.ts) | `@Permissions(['feature:action'])` route decorator |
| [`feature-tier.enum.ts`](../server/src/common/enums/feature-tier.enum.ts) | `FeatureTier: CORE \| STARTER \| PRO \| ENTERPRISE` |
| [`subscription-status.enum.ts`](../server/src/common/enums/subscription/subscription-status.enum.ts) | `SubscriptionStatus: TRIAL \| ACTIVE \| PAST_DUE \| CANCELED \| EXPIRED` |
| [`override-effect.enum.ts`](../server/src/common/enums/override-effect.enum.ts) | `OverrideEffect: ALLOW \| DENY` |
| [`role-scope-type.enum.ts`](../server/src/common/enums/role-scope-type.enum.ts) | `RoleScopeType: GLOBAL \| BRANCH \| WAREHOUSE` |

---

*Last updated: 2026-05-28 — Updated to restore Tenant Feature Overrides.*
