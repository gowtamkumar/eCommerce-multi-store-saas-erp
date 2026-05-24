# Codebase Understanding — System Infrastructure Modules

This document provides a detailed breakdown of the codebase implementation for the core system infrastructure modules of the Enterprise Multi-Tenant SaaS ERP.

---

## 1. Tenant & Subscription Domain

Located at: `server/src/modules/system/tenant/`, `server/src/modules/system/subscription-plan/`, and `server/src/modules/system/subscription-billing/`.

### 1.1 Database Entities
*   **`TenantEntity` (`entities/tenant.entity.ts`):** 
    Represents a tenant (store/business). Contains fields like `name`, `subdomain`, `customDomain`, `customDomainStatus`, `status` (ACTIVE, SUSPENDED, DELETED), and relationships to branches/warehouses.
*   **`TenantFeatureEntity` (`entities/tenant-feature.entity.ts`):** 
    Stores feature flags and limit overrides (e.g. `maxUsers`, `maxBranches`, `activeModules`) assigned to specific tenants.
*   **`SubscriptionPlanEntity`:** 
    Defines available SaaS pricing plans (e.g., BRONZE, SILVER, ENTERPRISE) with their basic feature lists and usage limits.

### 1.2 Core Logic & Services
*   **`TenantService` (`tenant.service.ts`):**
    Handles tenant registration, onboarding setup (invites, default branch creation), custom domain verification lifecycle, plan upgrades, and billing suspensions.
*   **`PublicTenantController` (`public-tenant.controller.ts`):**
    Exposes endpoints for guest-facing subdomain queries to fetch store theme details and configurations.
*   **`TenantController` (`tenant.controller.ts`):**
    Allows admin operators to audit tenants, view limits, and toggle feature gates.

### 1.3 Key API Endpoints
*   `GET /api/system/tenants` — Retrieve lists of all active tenants (Super-admin only).
*   `POST /api/system/tenants/onboard` — Initial register, seeding base configurations.
*   `POST /api/system/tenants/domain` — Configure and request verification for custom domains.

---

## 2. Organization Domain

Located at: `server/src/modules/system/organization/`.

### 2.1 Database Entities
*   **`BranchEntity` (`entities/branch.entity.ts`):**
    Defines physical or logical branch locations (stores, offices). Columns: `name`, `address`, `contactPhone`, `isActive`. Scoped with `tenantId`.
*   **`WarehouseEntity` (`entities/warehouse.entity.ts`):**
    Defines stock holding points. Columns: `name`, `address`, `isActive`, and optional `branchId` (if warehouse is owned by a branch).
*   **`WarehouseBinEntity` (`entities/warehouse-bin.entity.ts`):**
    Represents rack shelves or zones inside a warehouse. Columns: `zone`, `binCode`.

### 2.2 Core Logic & Services
*   **`BranchService` (`services/branch.service.ts`):**
    Manages branch onboarding, timezone overrides, local settings, and branch activity switches.
*   **`WarehouseService` (`services/warehouse.service.ts`):**
    Defines locations for stock fulfillment, tracks inventory transit lines, and resolves warehouse-to-branch structures.

### 2.3 Key API Endpoints
*   `GET /api/admin/organization/branches` — List branches scoped to active tenant.
*   `POST /api/admin/organization/warehouses` — Create a new warehouse and map its bins.

---

## 3. Global Audit Log Domain

Located at: `server/src/modules/system/audit-log/`.

### 3.1 Database Entities
*   **`AuditLogEntity` (`entities/audit-log.entity.ts`):**
    An append-only database record of every mutating operation. Contains `tenantId`, `userId`, `action` (e.g. `order.create`), `resourceType` (e.g. `ORDER`), `resourceId`, `payload` (JSON representing previous state and current diffs), and `ipAddress`.

### 3.2 Services & Controllers
*   **`AuditLogService` (`audit-log.service.ts`):**
    Injectable logger. Exposes asynchronous log methods called inside system interceptors or manually in sensitive service blocks.
*   **`AuditLogController` (`audit-log.controller.ts`):**
    Allows managers to search, filter by user/entity, and export chronological trails of tenant activities.
