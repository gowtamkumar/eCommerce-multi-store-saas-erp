# Developer Guideline: Subscription & Billing System

This document provides a comprehensive A-to-Z guide for developers on the multi-tenant subscription, billing, and expiration protection systems.

## 1. Overview
The platform uses a centralized subscription management system where each `Tenant` is linked to a `SubscriptionPlan`. Access to the store dashboard is strictly controlled based on the tenant's `subscriptionStatus` and `subscriptionEndsAt`.

## 2. Subscription Plan Management

### Database Entities
- **SubscriptionPlanEntity**: Defines global plans (Name, Price, Features, Billing Cycle).
- **TenantEntity**: Stores subscription state (`subscriptionStatus`, `subscriptionEndsAt`, etc.).
- **SubscriptionInvoiceEntity**: Records every transaction/payment history.

### Creating Plans (Super Admin)
Plans are managed via the Super Admin backend. When creating a plan, you specify:
- `billingCycle`: `MONTHY` or `YEARLY`.
- `features`: An array of strings representing entitled features.
- `price`: Monthly/Yearly cost in BDT.

## 3. Billing & Renewal Flow

The renewal flow is designed to be resilient, even when a tenant is already expired.

### A. Initiation
When a tenant admin clicks "Renew" or "Upgrade":
1. Frontend calls `POST /api/v1/billing/initiate`.
2. Backend generates a `SubscriptionInvoice` (PENDING) and a unique `transactionId`.
3. Backend uses `SslCommerzPaymentStrategy` to get a `gatewayUrl`.
4. User is redirected to the payment gateway.

### B. Gateway Callback
The payment gateway (SSLCommerz) is configured to redirect back to the **Frontend root-level routes**:
- `success_url`: `/billing/success?tran_id={id}`
- `fail_url`: `/billing/fail?tran_id={id}`
- `cancel_url`: `/billing/cancel?tran_id={id}`

> [!IMPORTANT]
> These routes are located in `client/app/billing/` (root-level) to bypass the `admin` middleware and authentication redirects during expiration.

### C. Completion Sync
Once the user lands on the success page:
1. The frontend calls `POST /api/v1/billing/complete/success?tran_id={id}`.
2. The backend:
   - Validates the transaction.
   - Updates the `SubscriptionInvoice` to `COMPLETED`.
   - Extends the `Tenant`'s `subscriptionEndsAt`.
   - Sets `subscriptionStatus` to `ACTIVE` and `status` to `ACTIVE`.
3. The frontend then calls `refreshSettings()` to update the global state.

## 4. Dashboard Expiration Protection

### Backend: `TenantStatusGuard`
Located at `server/src/common/guards/tenant-status.guard.ts`.
- Blocks all requests with `403 Forbidden` if the tenant status is `EXPIRED` or `INACTIVE`.
- **Exception**: Routes decorated with `@PublicDuringExpiration()`.

### Bypassing Protection
Use `@PublicDuringExpiration()` on endpoints that MUST work during expiration (e.g., Auth Refresh, Billing Initiation, Site Settings):
```typescript
@Get('current')
@PublicDuringExpiration()
async getCurrentSubscription(...) { ... }
```

### Frontend: Expiration Overlay
Located in `AdminLayout.tsx`.
- Checks `settings.status === 'expired'`.
- If expired, it shows a non-dismissible tailwind overlay with a "Renew Now" button.
- It allows navigation *only* to `/admin/settings/billing`.

## 5. Caching & State Management

To prevent users from being stuck in an "expired" state after renewal:
1. **No-Cache Services**: `getSettings.ts` and `tenant.ts` use `cache: 'no-store'` to ensure the latest status is always fetched from the server.
2. **Settings Context**: The `useSettings` hook provides a `refreshSettings()` method to manually trigger a re-fetch of the tenant status.

## 6. Common Troubleshooting
- **Perpetual Loading on Success Page**: Ensure the backend controller is NOT using `@Res()` without sending a response, as this causes the API call to hang.
- **Redirect Loop to Login**: Ensure the callback URLs point to root-level `/billing/` routes instead of `/admin/` routes to avoid middleware interference.
