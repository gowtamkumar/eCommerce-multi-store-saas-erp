# Developer Guideline: Subscription & Billing System

This document provides a comprehensive A-to-Z guide for developers on the multi-tenant subscription, billing, and expiration protection systems.

## 1. Overview
The platform uses a centralized subscription management system where each `Tenant` is linked to a `SubscriptionPlan`. All new merchants start with a **14-Day Free Trial**, and access is strictly controlled based on the tenant's `subscriptionStatus` and `subscriptionEndsAt`.

## 2. Subscription Plan Management

### Database Entities
- **SubscriptionPlanEntity**: Defines global plans (Name, Monthly/Yearly Price, Features, etc.).
- **TenantEntity**: Stores subscription state (`subscriptionStatus`, `subscriptionEndsAt`, `subscriptionBillingCycle`).
- **SubscriptionInvoiceEntity**: Records every transaction/payment including the purchased `billingCycle`.

### Creating Plans (Super Admin)
Plans are managed via the Super Admin backend. Each plan supports dual pricing:
- `monthlyPrice`: Cost for 1 month of access.
- `yearlyPrice`: Cost for 1 year of access (usually discounted).
- `features`: An array of strings representing entitled features.

## 3. 14-Day Free Trial Logic

Every new merchant signing up via the **Onboarding flow** is automatically granted a 14-day free trial.

### Trial Implementation
- **TenantService.createTenant**: 
  - Sets `subscriptionStatus` to `TRIAL`.
  - Sets `subscriptionEndsAt` to `now + 14 days`.
  - Persists the merchant's intended `subscriptionBillingCycle`.
- **Dashboard UI**: Trial users see a "Free Trial Mode" badge and a relative countdown (e.g., "7 days remaining") in the Billing Dashboard.
- **Trial Expiration**: Once `now > subscriptionEndsAt`, the tenant is restricted just like a regular expired subscription.

## 4. Billing & Renewal Flow

The renewal flow is designed to be resilient, even when a tenant is already expired or in trial.

### A. Initiation
When a tenant admin clicks "Renew" or "Upgrade":
1. Frontend calls `POST /api/v1/billing/initiate` with the selected `planId` and `billingCycle`.
2. Backend generates a `SubscriptionInvoice` (PENDING) and a unique `transactionId`.
3. Backend uses `SslCommerzPaymentStrategy` to get a `gatewayUrl`.

### B. Completion Sync
Once the user completes payment and lands on the success page:
1. The frontend calls `POST /api/v1/billing/complete/success?tran_id={id}`.
2. The backend:
   - Sets `subscriptionStatus` to `ACTIVE`.
   - Recalculates `subscriptionEndsAt` by adding 1 month or 1 year based on the invoice's `billingCycle`.
   - **Calculation Rule**: If the tenant was expired or in trial, the new period starts from **today**. If already active, it appends to the current end date.
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
