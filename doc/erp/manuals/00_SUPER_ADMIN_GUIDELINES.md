# Super Admin Guidelines

This document outlines the architectural and functional guidelines for implementing the **Super Admin** role and its associated features in the eCommerce Multi-Tenant SaaS platform.

## 1. Overview
The Super Admin is the system-level administrator responsible for managing the entire platform infrastructure, monitoring tenant health, and handling billing/subscription life cycles across all merchants.

## 2. Access Control & Security
- **Role Identification**: The system uses `UserRole.SuperAdmin` (assigned in the `UserEntity`) to distinguish system admins from tenant admins.
- **Cross-Tenant Access**: Super Admin endpoints must explicitly bypass the standard `TenantGuard` to allow visibility into data across all `tenantId` partitions.
- **Sensitive Operations**: Critical actions like store suspension or plan changes should log an audit trail (Admin Activity Log) to track which Super Admin performed the change.

## 3. Core Features Guidelines

### 3.1 View All Stores (Tenants)
- **Objective**: Provide a central dashboard to monitor all merchant stores.
- **Implementation**:
    - Fetch all entries from the `TenantEntity`.
    - Include metadata such as: Store Name, Owner Email, Created Date, Current Plan, and Status (Active/Suspended).
    - Provide filtering by status (e.g., "Draft", "Active", "Suspended") and search by store name or owner.

### 3.2 Suspend Store
- **Objective**: Temporarily or permanently disable a store from serving traffic.
- **Implementation**:
    - Add a `status` field to the `TenantEntity` (e.g., `enum { ACTIVE, SUSPENDED, DELETED }`).
    - Create a `PATCH /tenant-traffic/tenants/:id/status` endpoint.
    - **Enforcement**: Update the generic `TenantGuard` or a Global Interceptor to check the tenant status. If a tenant is `SUSPENDED`, the API should return a `403 Forbidden` with a message like `"Store is temporarily suspended"`.
    - **Frontend**: The public-facing store should show a clean "Maintenance" or "Suspended" page.

### 3.3 Change Plan (Subscription Management)
- **Objective**: Manually upgrade or downgrade a merchant's subscription plan.
- **Implementation**:
    - Update the `plan` field in the `TenantEntity` or a dedicated `SubscriptionEntity`.
    - Create a `PATCH /tenant-traffic/tenants/:id/plan` endpoint.
    - **Logic**: 
        - When changing a plan, invalidate any cached store settings.
        - If integrated with a payment gateway (e.g., Stripe), trigger a subscription update via the gateway API to ensure billing stays in sync.
        - Re-evaluate feature flags for the tenant immediately.

### 3.4 See Traffic (Platform Analytics)
- **Objective**: Monitor the overall health and popularity of stores across the platform.
- **Implementation**:
    - **Option A (Internal Tracking)**: Implement a lightweight tracking service that logs requests or page views into a `TrafficLog` table (partitioned by `tenantId`).
    - **Option B (Aggregation)**: Aggregate data from the `OrderEntity` and `CartEntity` to show revenue/conversion trends per store.
    - **Metrics to Track**:
        - Daily Active Users (DAU) per tenant.
        - Request volume/Peak loads.
        - Bandwidth/Storage usage (if applicable for media-heavy stores).
    - **Visualization**: Use a "Super Admin Dashboard" with charts showing platform-wide growth vs. individual store performance.

## 4. UI/UX Recommendations
- **Isolation**: The Super Admin dashboard should be a separate route (e.g., `/tenant-traffic/*`) to avoid confusion with the standard merchant admin dash (`/admin/*`).
- **Global Search**: Implement a high-performance search across all tenants and users.
- **Critical Alerts**: Highlight stores that are exceeding usage limits or have failed payments.

---

> [!IMPORTANT]
> Always ensure that Super Admin endpoints are protected by both `JwtAuthGuard` and a specialized `RolesGuard` checking for `UserRole.SuperAdmin`.
