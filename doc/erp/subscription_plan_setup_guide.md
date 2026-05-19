# Subscription Plan Setup & Seeding Guide

This guide describes how to initialize, run setup, and seed/synchronize subscription plan tiers (Starter, Pro Seller, Enterprise) for the eCommerce Multi-Tenant SaaS platform.

---

## 1. Local Infrastructure Startup

The application environment runs inside Docker. Start the database, cache, mailhog, and backend server containers:

```bash
# From the project root directory
docker-compose -f docker-compose.dev.yml up -d
```

Confirm that the backend server is running and healthy:
```bash
docker ps | grep multi_tenant_server_dev
```
The server will be reachable locally at `http://localhost:3900`.

---

## 2. Super Admin Initial Setup & Seeding

The platform uses a unified `/setup` routine to create the initial Super Admin account and seed/synchronize the core subscription plans with their definitive route-based feature slugs.

### Setup Request
Send a `POST` request to initialize the super admin and plans:

- **Endpoint:** `POST http://localhost:3900/super-admin/setup`
- **Headers:** `Content-Type: application/json`
- **Payload:**
```json
{
  "name": "Super Admin",
  "username": "superadmin",
  "email": "superadmin@example.com",
  "password": "SecurePassword123!"
}
```

### Seeding Behavior
When this endpoint is triggered:
1. It creates the **Super Admin** user record in the database.
2. It seeds/updates the **three dynamic subscription tiers** with their precise route paths:

| Tier | Price (Monthly / Yearly) | Feature Slugs (Entitlements) |
| :--- | :--- | :--- |
| **Starter** | `$0.00` / `$0.00` | `['/admin', '/admin/products', '/admin/categories', '/admin/brands', '/admin/media', '/admin/profile', '/admin/faqs']` |
| **Pro Seller** | `$29.00` / `$290.00` | All Starter features + `['/admin/pos', '/admin/orders', '/admin/returns', '/admin/fulfillment', '/admin/couriers', '/admin/coupons', '/admin/promotions', '/admin/pages', '/admin/reviews', '/admin/expenses', '/admin/settings', '/admin/customers', '/admin/subscribers', '/admin/leads', '/admin/carts', '/admin/payments', '/admin/campaigns']` |
| **Enterprise** | `$99.00` / `$990.00` | All Pro Seller features + `['/admin/warehouses', '/admin/hrm', '/admin/inventory', '/admin/finance', '/admin/finance/profit-loss', '/admin/finance/balance-sheet', '/admin/finance/ledger', '/admin/invoices', '/admin/purchases', '/admin/grn', '/admin/suppliers', '/admin/reports', '/admin/reports/sales', '/admin/reports/profit-loss', '/admin/reports/supplier-ledger', '/admin/reports/customer-ledger', '/admin/reports/cash-flow', '/admin/reports/export', '/admin/reports/finance']` |

*Note: If the plans already exist in the database, calling setup will safely **synchronize** and update their pricing, descriptions, and feature lists to prevent drift.*

---

## 3. Upgrading / Downgrading Tenant Plans

To upgrade or downgrade a merchant tenant's plan:

1. **Log in as Super Admin** (`POST /auth/login` using your setup credentials) to retrieve a JWT Bearer token.
2. **Execute the Plan Update:**

- **Endpoint:** `PATCH http://localhost:3900/super-admin/tenants/:id/plan`
- **Headers:** 
  - `Authorization: Bearer <your_jwt_token>`
  - `Content-Type: application/json`
- **Payload:**
```json
{
  "planId": "<target_subscription_plan_uuid>"
}
```

### Background Execution Flow
When the plan is updated:
- The backend changes the tenant's `subscriptionPlanId` to the new plan.
- The `TenantFeatureEntity` records are synchronized inside a database transaction:
  - Features belonging to the new plan are toggled (`isEnabled = true`) or created.
  - Legacy features not present in the new plan are soft-disabled (`isEnabled = false`) to preserve user RBAC role-permission configuration for future upgrades.
- Caches are automatically flushed:
  - Tenant structure cache (`tenant:id:${id}`) is cleared.
  - User permissions manifest cache (`rbac:manifest:${tenantId}:${userId}`) is invalidated for all organization members immediately.
