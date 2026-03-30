# Developer Guideline: Subscription & Billing System

This document provides a comprehensive A-to-Z guide for developers on the multi-tenant subscription, billing, and expiration protection systems.

## 1. Core Architecture

The platform uses a centralized subscription management system where each `Tenant` is linked to a `SubscriptionPlan`. Access is strictly controlled based on the tenant's `subscriptionStatus` and `subscriptionEndsAt`.

### Database Entities
- **SubscriptionPlanEntity**: Defines global plans (Name, Monthly/Yearly Price, Features array).
- **TenantEntity**: Stores subscription state:
    - `subscriptionStatus`: `TRIAL`, `ACTIVE`, `PAST_DUE`.
    - `subscriptionEndsAt`: The hard deadline for access.
    - `isExpired`: A calculated getter (`now > subscriptionEndsAt`).
- **SubscriptionInvoiceEntity**: The audit trail for payments. Stores `transactionId`, `amount`, `billingCycle`, and `status`.

---

## 2. The 14-Day Free Trial

Every new merchant signing up is automatically granted a 14-day free trial to explore the platform.

### Implementation
- **Creation**: `TenantService.createTenant` sets `subscriptionStatus: TRIAL` and `subscriptionEndsAt: now + 14 days`.
- **Restriction**: Trial users are treated exactly like subscribed users in guards, but they have a distinct status for UI badges.
- **Expiration**: Once the 14 days pass, `isExpired` becomes true, triggering the Expiration Protection.

---

## 3. Expiration Protection System (The "Lockout")

To ensure revenue, the platform restricts access to the Admin Dashboard once a subscription expires.

### Backend: `TenantStatusGuard`
Located at `server/src/common/guards/tenant-status.guard.ts`.
- **Global Guard**: Registered in `AppModule`, it checks every request.
- **Logic**:
    - Allows `SUPER_ADMIN` to bypass all checks.
    - Blocks requests with `403 Forbidden` if `tenant.status === EXPIRED` or `tenant.isExpired`.
- **Bypassing with `@PublicDuringExpiration()`**: 
    Some endpoints MUST remain accessible so the user can pay or view their status. Decorate these routes to whitelist them:
    ```typescript
    @Get('current')
    @PublicDuringExpiration() // Allows access even if expired
    async getCurrentSubscription(...) { ... }
    ```

### Frontend: Expiration Overlay
Located in `AdminLayout.tsx` (Client).
- Monitors the `settings.status` and `settings.isExpired`.
- If true, it renders a non-dismissible **Glassmorphism Overlay** over the entire dashboard.
- The overlay prevents clicks but allows navigation to the `/admin/settings/billing` page so the user can renew.

---

## 4. Billing & Renewal Lifecycle

The renewal flow is designed to be resilient, handling active, trial, and expired states.

### Step 1: Initiation
- **Endpoint**: `POST /api/v1/billing/initiate`
- **Logic**: 
    - Validates plan and billing cycle.
    - **Renewal Restriction**: Blocks renewal of the *same* plan if the current subscription is still active (prevents accidental double-charging). Users can still upgrade/downgrade at any time.
    - Generates a `SubscriptionInvoice` in `PENDING` state.
    - Returns an SSLCommerz `gatewayUrl`.

### Step 2: Payment (SSLCommerz)
- The user is redirected to the SSLCommerz hosted page.
- On completion, the gateway hits the backend callbacks (`/success`, `/fail`, `/cancel`).

### Step 3: Completion & Logic
- **Endpoint**: `POST /api/v1/billing/complete/success`
- **The "Extend vs. Start Fresh" Rule**:
    - **If Currently Active**: The new period is appended to the *existing* `subscriptionEndsAt`. (e.g., if 3 days remain, and user buys a month, they get 33 days).
    - **If Expired / Trial**: The new period starts from **Today** (`now + cycle`).
- **Status Update**: Sets `subscriptionStatus` to `ACTIVE` and `status` to `ACTIVE` (if it was `EXPIRED`).

---

## 5. Feature Gating (`SubscriptionGuard`)

Features are restricted based on the plan's `features` array.

- **Decorator**: `@RequireFeature('feature_name')`
- **Guard**: `SubscriptionGuard` checks if the tenant's plan includes the required string.
- **Usage**:
    ```typescript
    @Post('custom-domain')
    @RequireFeature('custom_domain')
    async updateDomain(...) { ... }
    ```

---

## 6. Best Practices for Developers

1.  **Always use `@PublicDuringExpiration()`** for any new endpoint required by the Billing or Profile pages.
2.  **Use `cache: 'no-store'`** in frontend fetch calls for tenant settings to ensure the lockout overlay disappears immediately after a successful renewal.
3.  **Check `isExpired`**, not just `subscriptionStatus`. A tenant can be `ACTIVE` but have an `endsAt` in the past if a background worker hasn't updated the status yet. The getter `isExpired` is the source of truth.
4.  **Currency**: All billing is currently processed in **BDT** (default for SSLCommerz sandbox).

---
