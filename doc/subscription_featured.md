# Subscription Features Documentation

This document outlines the multi-tenant subscription system, including plan details, feature gating, and technical implementation.

## 1. Overview
The platform uses a tiered subscription model to provide different levels of service to tenants. Each tenant is associated with a `SubscriptionPlan`, which defines their allowed features, resource limits, and billing cycle.

## 2. Subscription Plans
The following plans are currently supported by the platform:

| Plan | Price (Monthly) | Description | Key Features |
| :--- | :--- | :--- | :--- |
| **Free / Starter** | $0.00 | Basic store for individuals | Subdomain allocation, 100 products, basic theme |
| **Growth / Basic** | $29.00 | Scaling for small teams | Custom domain support, 500 products, advanced theme |
| **Business / Pro** | $79.00 | For established sellers | Advanced analytics, Remove badge, Priority support |
| **Enterprise** | Custom | Custom needs | Unlimited products, Multi-user access, API access |

## 3. Subscription Features matrix
Specific features are toggled based on the tenant's active plan.

| Feature Key | Description | Starter | Growth | Business | Enterprise |
| :--- | :--- | :---: | :---: | :---: | :---: |
| `custom_domain` | Use your own URL (e.g., store.com) | ❌ | ✅ | ✅ | ✅ |
| `advanced_analytics` | Deep insights into sales and traffic | ❌ | ❌ | ✅ | ✅ |
| `remove_branding` | Remove "Powered by YourSaaS" badge | ❌ | ❌ | ✅ | ✅ |
| `unlimited_products` | No limit on product listings | ❌ | ❌ | ❌ | ✅ |
| `staff_accounts` | Add team members with roles | ❌ | ✅ | ✅ | ✅ |
| `multi_currency` | Support for multiple currencies | ❌ | ❌ | ✅ | ✅ |

## 4. Technical Implementation

### Feature Gating
The system enforces feature access using a combination of decorators and guards.

#### `@RequireFeature(feature: string)`
Automate feature checks on controller routes by applying this decorator.

```typescript
@Get('analytics')
@RequireFeature('advanced_analytics')
async getAnalytics() {
  // ... logic
}
```

#### `SubscriptionGuard`
The `SubscriptionGuard` intercepts requests to routes decorated with `@RequireFeature`. It verifies:
1. If the user is a `SUPER_ADMIN` (bypasses check).
2. If the tenant's current plan includes the required feature string in the `features` array.

### Billing Lifecycle
- **Billing Cycles**: Plans can be billed `MONTHLY` or `YEARLY`.
- **Status Transitions**:
    - `ACTIVE`: Access to all plan features.
    - `INACTIVE`: Tenant has no active plan.
    - `EXPIRED`: Subscription end date has passed; access may be restricted.
    - `PAST_DUE`: Payment failure; grace period active.

## 5. Management
- **Super Admin**: Can manage plans and manually update tenant subscriptions via the Super Admin Dashboard.
- **Tenant Admin**: Can view their current plan and upgrade via the Billing section of the Store Dashboard.

---

> [!NOTE]
> When adding new features to the codebase that require a specific plan, always define a unique feature string and use the `@RequireFeature` decorator.
