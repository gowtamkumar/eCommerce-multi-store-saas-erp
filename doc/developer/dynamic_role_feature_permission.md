# Dynamic Role & Feature Permission Management in a Multi-Tenant SaaS ERP

> **Author:** Senior Engineer perspective  
> **Context:** Multi-tenant SaaS ERP with dynamic roles and feature-level permissions  
> **Purpose:** Step-by-step guide — conceptual design, data modeling, and operational strategy

---

## Table of Contents

1. [Why This Is Hard (And Why It Matters)](#1-why-this-is-hard)
2. [Core Concepts & Terminology](#2-core-concepts--terminology)
3. [The Two Axes of Permission](#3-the-two-axes-of-permission)
4. [The Permission Hierarchy](#4-the-permission-hierarchy)
5. [Data Model Design (Conceptual)](#5-data-model-design-conceptual)
6. [Step-by-Step: Role Management](#6-step-by-step-role-management)
7. [Step-by-Step: Feature Permission Management](#7-step-by-step-feature-permission-management)
8. [Permission Resolution Algorithm](#8-permission-resolution-algorithm)
9. [Multi-Tenant Isolation Rules](#9-multi-tenant-isolation-rules)
10. [UI-Level Permission Gating Strategy](#10-ui-level-permission-gating-strategy)
11. [Audit Trail & Compliance](#11-audit-trail--compliance)
12. [Common Pitfalls to Avoid](#12-common-pitfalls-to-avoid)
13. [Operational Playbook](#13-operational-playbook)
14. [Architecture Summary Diagram](#14-architecture-summary-diagram)

---

## 1. Why This Is Hard

In a simple app, you can hard-code roles (`admin`, `user`). In a **multi-tenant SaaS ERP**, this breaks immediately because:

| Challenge | Example |
|-----------|---------|
| Every tenant has different org structures | Tenant A has "Branch Manager", Tenant B doesn't |
| Feature sets differ per subscription tier | Pro plan unlocks Payroll, Starter plan doesn't |
| The same feature may need different access levels | Sales Rep can *view* PO, Manager can *approve* PO |
| Permissions must be auditable | Compliance requires knowing *who* gave *whom* access and *when* |
| Roles must be composable | A user may have multiple roles across departments |

> [!IMPORTANT]  
> The goal is a **policy engine**, not a hard-coded role check. Roles and features must be **data-driven**, not code-driven.

---

## 2. Core Concepts & Terminology

| Term | Definition |
|------|-----------|
| **Tenant** | An organization/company using your SaaS platform |
| **Role** | A named collection of permissions assigned to users within a tenant |
| **Permission** | A single atomic capability (e.g., `invoice:create`, `po:approve`) |
| **Feature** | A module or capability group (e.g., Payroll, POS, Procurement) |
| **Feature Flag** | A switch that enables/disables a feature for a tenant (tied to subscription) |
| **Feature Permission** | A user's access level *within* an enabled feature |
| **Scope** | The boundary within which a permission applies (e.g., Branch, Warehouse) |
| **Policy** | The resolved, combined result of all roles + feature flags for a user |

---

## 3. The Two Axes of Permission

Think of permissions as a **2D matrix**:

```
                        FEATURES (what module?)
                  ┌───────────┬───────────┬───────────┐
                  │ Inventory │  Payroll  │    POS    │
  ACTIONS ────────┼───────────┼───────────┼───────────┤
  (what can       │  view     │  view     │  view     │
   they do?)      │  create   │  create   │  sell     │
                  │  edit     │  approve  │  refund   │
                  │  delete   │  export   │  discount │
                  └───────────┴───────────┴───────────┘
```

A **permission** = `feature` + `action`  
Example: `payroll:approve`, `inventory:delete`, `pos:refund`

A **role** = a named bundle of these `feature:action` permissions.

---

## 4. The Permission Hierarchy

Permissions flow from **top (platform) to bottom (user)**, with each level able to restrict but **never exceed** the level above it.

```
┌─────────────────────────────────────────────────────┐
│  PLATFORM LEVEL (SaaS Provider)                     │
│  → Defines all possible features & permissions      │
│  → Enables/disables features per subscription tier  │
└─────────────────────┬───────────────────────────────┘
                      │ constrains
┌─────────────────────▼───────────────────────────────┐
│  TENANT LEVEL (Organization)                        │
│  → Selects which features are active                │
│  → Creates custom roles using available permissions │
│  → Cannot invent permissions not on the platform    │
└─────────────────────┬───────────────────────────────┘
                      │ constrains
┌─────────────────────▼───────────────────────────────┐
│  BRANCH / DEPARTMENT LEVEL (Scope)                  │
│  → Assigns roles to users within a scope            │
│  → A user can have different roles in diff branches │
└─────────────────────┬───────────────────────────────┘
                      │ applies to
┌─────────────────────────────────────────────────────┐
│  USER LEVEL                                         │
│  → Assigned one or more roles                       │
│  → Final policy = union of all role permissions     │
└─────────────────────────────────────────────────────┘
```

> [!NOTE]  
> This is sometimes called **Hierarchical RBAC (Role-Based Access Control)**. The key principle: **lower levels inherit from upper levels but can only be more restrictive, never more permissive.**

---

## 5. Data Model Design (Conceptual)

### 5.1 Entities and Relationships

```
Platform
  └── Permission               (e.g., "payroll:approve", associated with feature slug "payroll")

Tenant
  ├── SubscriptionPlan         (which features are unlocked as JSON array of slugs)
  ├── Role                     (custom roles defined by tenant)
  │     └── RolePermission     (which permissions this role grants)
  └── Branch / Department

User
  └── UserRole                 (user → role, scoped to branch/global)
```

### 5.2 Key Tables (Logical Description)

#### `permissions` (Platform-owned)
- `id`, `code` (e.g., `payroll:approve`), `name`, `description`
- `module` (e.g., `Finance`, `HRM`), `feature` (the feature slug, e.g., `payroll`)
- `action` (e.g., `approve`), `risk_level` (low / medium / high / critical)

#### `roles` (Tenant-owned)
- `id`, `tenant_id`, `name`, `description`, `is_system_role` (bool)
- `is_system_role = true` means it's auto-created (e.g., "Super Admin") and cannot be deleted

#### `role_permissions` (Tenant-owned)
- `role_id`, `permission_id` (references `permissions.id`)

#### `user_role_assignments` (Tenant-owned)
- `user_id`, `role_id`, `scope_type` (global/branch/warehouse), `scope_id`
- `assigned_at`, `assigned_by`, `expires_at` (optional time-bound access)

#### `user_permission_overrides` (Optional, Tenant-owned)
- `user_id`, `permission_slug`, `effect` (`allow` / `deny`)
- `reason`, `override_by`, `expires_at`
- *Note: These are kept for management/future compatibility, but are excluded from the active permission resolution hot path.*


---

## 6. Step-by-Step: Role Management

### Step 1 — Define the "Super Admin" System Role (Platform Bootstrap)

When a new tenant is created, automatically provision a **system role** called `Super Admin` or `Owner`. This role:
- Gets ALL permissions for ALL enabled features
- Cannot be modified or deleted
- Is assigned to the tenant creator by default

> [!CAUTION]  
> Never let the Super Admin role be configurable. If someone accidentally removes `user:manage` from it, the tenant gets locked out.

---

### Step 2 — Seed Default Roles (Tenant Onboarding)

Provide sensible defaults based on the industry (ERP context):

| Default Role | Typical Permissions |
|---|---|
| `Super Admin` | All permissions |
| `Branch Manager` | All permissions scoped to their branch |
| `Accountant` | Finance: view, create, edit; Reports: export |
| `Sales Associate` | POS: sell, view; Inventory: view |
| `HR Manager` | HRM: all; Payroll: approve |
| `Procurement Officer` | PO: create, edit; GRN: create; Suppliers: view |
| `Inventory Manager` | Inventory: all; Transfers: approve |
| `Viewer` | All features: view only |

Tenants can **clone**, **modify**, or **delete** any non-system role.

---

### Step 3 — Let Tenants Create Custom Roles

The tenant admin should be able to:
1. **Name** the role (e.g., "Regional Supervisor")
2. **Pick permissions** from a categorized list (grouped by feature)
3. **Set scope** — is this role global or branch-level?
4. **Save** — the role is immediately available to assign

> [!TIP]  
> In the UI, show permissions grouped by feature with toggle switches. Show a "risk badge" (low/medium/high) next to sensitive permissions like `payroll:export` or `user:delete`.

---

### Step 4 — Assign Roles to Users

When assigning roles:
- A user can hold **multiple roles** simultaneously
- Specify the **scope**: global, or tied to a specific branch/warehouse
- Optionally set an **expiry date** (for contractors, temporary promotions)
- The assigning user must themselves have `user:manage` permission

---

### Step 5 — Flat Roles (Inheritance Removed)

For simplicity and performance, roles are flat and do not support inheritance. Multiple roles are assigned to a user to combine permissions via union.

---

## 7. Step-by-Step: Feature Permission Management

### Step 1 — Platform Defines the Feature Catalog

The SaaS provider (you) defines all available features in the system.

### Step 2 — Subscription Controls Feature Availability

When a tenant upgrades/downgrades:
1. The tenant's `subscription_plan_id` is updated.
2. Features not in the new plan are automatically unavailable (their slugs are no longer in the plan's feature list).
3. Existing role-permissions tied to these features become **inert** (not deleted, just non-resolving). If the tenant upgrades again, they automatically work again.

---

### Step 3 — Role Admin Controls Action-Level Access

Within the enabled features of a plan, the tenant admin defines which **actions** each role can perform by mapping permissions:

| Feature | Action | Sales Role | Manager Role | Accountant Role |
|---------|--------|:-:|:-:|:-:|
| Invoice | view | ✅ | ✅ | ✅ |
| Invoice | create | ✅ | ✅ | ✅ |
| Invoice | approve | ❌ | ✅ | ✅ |
| Invoice | delete | ❌ | ❌ | ✅ |
| Invoice | export | ❌ | ✅ | ✅ |

---

### Step 4 — User-Level Overrides (Kept for compatibility, bypassed in resolver)

Direct per-user overrides can be managed via the API but are excluded from the active resolution engine to optimize latency and performance.

---

## 8. Permission Resolution Algorithm

The `PermissionResolutionService` implements this decision tree for every protected API call:

```
STEP 1: Is the feature enabled for this tenant?
   → Check explicit override in the `tenant_features` database table first.
   → If override exists: use override value (true = enabled, false = disabled).
   → If no override exists: fall back to checking if the feature slug is in the tenant's subscription plan features list.
   → NO  → DENY (feature not in subscription)
   → YES → continue

STEP 2: Collect all active, non-expired role assignments for the user in this tenant.
   → Roles are flat (no inheritance chain).
   → Multiple assigned roles are unioned together.

STEP 3: Does the collected permission set include the required permission slug (feature:action)?
   → YES → ALLOW
   → NO  → DENY
```

---

## 9. Multi-Tenant Isolation Rules

This is critical. Every permission check MUST be tenant-scoped.

### Rule 1 — All Permission Data is Tenant-Scoped
- Every role, role-permission, and user-role assignment has a `tenant_id`
- Queries ALWAYS filter by `tenant_id` — never cross-tenant queries

### Rule 2 — The Super Admin of Tenant A Cannot Touch Tenant B
- Platform Super Admins (your internal team) are a separate concept from Tenant Super Admins
- Use a separate `platform_admins` table for your internal team

### Rule 3 — Scope Isolation Within a Tenant
- A user with `Branch Manager` role for **Branch A** cannot approve transfers for **Branch B**
- The `user_roles.scope_id` is checked against the current operation's target resource

### Rule 4 — Feature Flags are Per-Tenant
- Tenant A on Pro plan has Payroll enabled
- Tenant B on Starter plan has Payroll disabled
- Their role definitions may be identical, but the resolution differs at Step 1

---

## 10. UI-Level Permission Gating Strategy

Checking permissions only on the backend is secure but creates poor UX. Gate the UI too.

### 10.1 Navigation Gating
- Sidebar links to modules (e.g., Payroll) only appear if the feature is enabled **AND** the user has at least `view` permission
- "Locked" items can still show with a lock icon and "Upgrade Plan" tooltip (for feature flags)

### 10.2 Action Button Gating
- "Approve" button is hidden/disabled if the user lacks `invoice:approve`
- Use a permission context/hook on the frontend that the backend policy is the source of truth for

### 10.3 Data Field Gating
- Some fields (e.g., salary amounts, cost prices) should be hidden if the user lacks the right permission
- This prevents information leakage even if they somehow navigate to the page

### 10.4 The Frontend Permission Contract
On login, the backend returns a **permission manifest** (compact token or dedicated API):
```
{
  "features_enabled": ["inventory", "pos", "procurement"],
  "permissions": ["inventory:view", "inventory:create", "pos:sell", "po:view"]
}
```
The frontend uses this manifest for all UI gating decisions. **The backend always re-validates on every API call** — the manifest is only for UX purposes.

> [!IMPORTANT]  
> The frontend permission manifest is a **UX convenience**, not a security control. The backend is the single source of truth. Never skip server-side permission checks.

---

## 11. Audit Trail & Compliance

Every permission-related action must be logged for compliance (SOC 2, ISO 27001, etc.).

### What to Log

| Event | Details to Capture |
|-------|-------------------|
| Role created | who created, when, what permissions |
| Role modified | before/after permission set, changed by |
| Role deleted | who deleted, timestamp, any users affected |
| User role assigned | assigning user, target user, role, scope, expiry |
| User role revoked | who revoked, reason |
| Permission override added | target user, permission, effect, reason, expiry |
| Feature enabled/disabled | tenant, feature, triggered by (system/admin), reason |
| Failed permission check | user, resource, action, timestamp (security monitoring) |

### Audit Log Properties
- **Immutable**: Audit logs are append-only — never update or delete
- **Actor context**: Always capture who performed the action (`actor_id`, `actor_ip`, `user_agent`)
- **Before/after**: For changes, capture the full diff, not just the new state
- **Retention policy**: Define how long logs are kept (typically 1–7 years for ERP)

---

## 12. Common Pitfalls to Avoid

> [!WARNING]

| Pitfall | Why It's Dangerous | Better Approach |
|---------|-------------------|-----------------|
| Hard-coding role checks (`if user.role === 'admin'`) | Breaks with dynamic roles; requires code deploys to update | Always check permission slugs, not role names |
| Checking permissions only on the frontend | Trivially bypassable; security theater | Backend validates every API request |
| Granting permissions by feature, not action | "Has Payroll access" is too coarse | Use `payroll:view`, `payroll:approve` etc. |
| Deleting permissions on downgrade | Destroys tenant configuration | Disable the feature flag; keep permissions intact |
| Allowing unlimited user-level overrides | Creates untraceable permission sprawl | Require justification + expiry for every override |
| Not scoping permissions to branches | Branch Manager of A can act on B | Always join `scope_id` in permission checks |
| Caching permissions indefinitely | User can't be de-provisioned in real-time | Short TTL cache (5 min) + invalidation on role change |

---

## 13. Operational Playbook

### When a new tenant is created:
1. Create the tenant record
2. Assign subscription plan → auto-enable features
3. Provision system roles (Super Admin, default roles)
4. Assign Super Admin role to the creating user
5. Send onboarding email with role configuration guide

### When a tenant upgrades their plan:
1. Update tenant's subscription plan (which changes the list of dynamic features)
2. Notify the tenant admin of newly available features
3. Do NOT auto-grant permissions — let the admin configure roles

### When a tenant downgrades their plan:
1. Update tenant's subscription plan
2. Notify the tenant admin of affected roles and users
4. Log the event in the audit trail

### When an employee leaves:
1. Immediately revoke all `user_roles` for the departing user
2. Invalidate their session tokens
3. Log the de-provisioning event
4. Archive (not delete) their `user_permission_overrides` for audit purposes

### When a security incident is detected:
1. Use the audit log to trace who had access to what, and when
2. Identify any anomalous permission grants (overrides without expiry, high-risk permissions)
3. Use the "Failed permission check" logs to identify probe attempts

---

## 14. Architecture Summary Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     SAAS PLATFORM LAYER                         │
│  ┌─────────────────────┐    ┌────────────────────────────────┐  │
│  │  Feature Catalog    │    │   Permission Definitions       │  │
│  │  (Pro/Starter/Ent.) │    │   (feature:action slugs)       │  │
│  └──────────┬──────────┘    └────────────────┬───────────────┘  │
└─────────────┼───────────────────────────────┼────────────────── ┘
              │ subscription controls          │ available to
              ▼                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      TENANT LAYER                               │
│  ┌───────────────────┐    ┌──────────────────────────────────┐  │
│  │  Tenant Features  │    │  Custom Roles + Role Permissions │  │
│  │  (enabled/dis.)   │    │  (bundles of permission slugs)   │  │
│  └───────────────────┘    └──────────────────────────────────┘  │
│                                      │                          │
│  ┌────────────────────────────────── │─────────────────────┐    │
│  │  Branch / Department              │                     │    │
│  │  ┌─────────────────────────────  ▼───────────────────┐ │    │
│  │  │  User Role Assignments (scoped to branch/global)  │ │    │
│  │  │  User Permission Overrides (allow/deny, time-box) │ │    │
│  │  └─────────────────────────────────────────────────┬─┘ │    │
│  └────────────────────────────────────────────────────│───┘    │
└───────────────────────────────────────────────────────│────────┘
                                                        │
                                                        ▼
┌─────────────────────────────────────────────────────────────────┐
│                   PERMISSION RESOLUTION ENGINE                  │
│   Feature Enabled? → Union Flat Roles Permissions?              │
│   → ALLOW or DENY                                               │
└─────────────────────────────────────────────────────────────────┘
                                                        │
                              ┌─────────────────────────┴──────┐
                              │                                │
                         ┌────▼────┐                    ┌──────▼──────┐
                         │ Backend │                    │  Frontend   │
                         │  API    │                    │  UI Gating  │
                         │ Guards  │                    │ (UX only)   │
                         └─────────┘                    └─────────────┘
```

---

## Quick Reference Checklist

### For Platform Design
- [ ] Define all features with plan-tier mapping
- [ ] Define all permission slugs as `feature:action`
- [ ] Build subscription → feature auto-enable logic
- [ ] Build permission resolution engine (3-step algorithm)
- [ ] Build audit logging for all permission events

### For Tenant Onboarding
- [ ] Provision system roles (Super Admin is non-deletable)
- [ ] Seed sensible default roles for the industry
- [ ] Assign Super Admin to tenant owner

### For Role Configuration
- [ ] Tenant admin can CRUD custom roles
- [ ] UI shows permissions grouped by feature
- [ ] Risk badges on sensitive permissions
- [ ] Role assignment supports scope + expiry

### For Security
- [ ] Every API call validates permissions server-side
- [ ] All permission data is tenant-scoped (no cross-tenant leakage)
- [ ] Audit log is append-only and immutable
- [ ] User-level overrides require justification + expiry

---

*This document is a living guide. Update it as the permission model evolves.*
