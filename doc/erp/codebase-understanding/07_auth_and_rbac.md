# Codebase Understanding — Auth, RBAC & User Management Modules

This document details the codebase for staff authentication, role-based access control (RBAC), dynamic permission management, branch/warehouse scope assignments, and user profile management.

---

## Module Locations

```
server/src/modules/admin/core/
├── auth/                             # Authentication (JWT, login, password reset)
│   ├── entities/                     # OTP and session tracking entities
│   ├── controllers/                  # Login, register, token-refresh endpoints
│   ├── services/                     # JWT signing, bcrypt comparison
│   └── auth.module.ts
├── rbac/                             # Role & Permission engine
│   ├── rbac.controller.ts            # Role CRUD, assignment, permission endpoints
│   ├── role-management.service.ts    # Role creation/cloning, permission seeding
│   ├── user-role-assignment.service.ts # Assign roles to users with scope limits
│   ├── user-permission-override.service.ts # Grant/revoke individual permissions
│   └── rbac.module.ts
└── user/                             # User profile management
    ├── entities/
    │   ├── user.entity.ts            # Core user record
    │   ├── role.entity.ts            # Role definition with permission relations
    │   ├── permission.entity.ts      # Permission code registry
    │   ├── user-role-assignment.entity.ts
    │   ├── user-permission-override.entity.ts
    │   └── staff-invitation.entity.ts
    ├── services/                     # User CRUD, invitation flow
    └── user.module.ts
```

---

## 1. Database Entity Map

### 1.1 `UserEntity` (`user/entities/user.entity.ts`)

The central identity record for all authenticated users (staff and customers):

| Column | Type | Purpose |
| :--- | :--- | :--- |
| `tenantId` | UUID | Strict tenant isolation |
| `email` | VARCHAR | Login identifier (unique per tenant) |
| `passwordHash` | VARCHAR | bcrypt-hashed credential |
| `firstName`, `lastName` | VARCHAR | Display name |
| `membershipTier` | ENUM | CRM tier (BRONZE, SILVER, GOLD, PLATINUM) |
| `creditLimit` | DECIMAL | B2B credit allowance |
| `creditHold` | BOOLEAN | Freeze order placement |
| `isStaff` | BOOLEAN | Distinguishes employees from customers |
| `isActive` | BOOLEAN | Soft-disable without deleting |

### 1.2 `RoleEntity` (`user/entities/role.entity.ts`)

Tenant-specific role definitions:
- `name` — Human-readable label (e.g. "Branch Manager", "Procurement Officer")
- `description` — Guidance notes
- `isSystemRole` — Protects built-in roles (Owner, Super Admin) from being deleted
- Relations: `ManyToMany` to `PermissionEntity` via `RolePermissionEntity` junction

### 1.3 `PermissionEntity` (`user/entities/permission.entity.ts`)

Global system permission registry (not tenant-scoped — shared across all tenants):
- `code` — Unique snake_case string (e.g. `inventory:adjust`, `pos:checkout`, `payroll:approve`)
- `module` — Feature area grouping (e.g. `INVENTORY`, `POS`, `HRM`)
- `description` — Human-readable action label

### 1.4 `UserRoleAssignmentEntity` (`user/entities/user-role-assignment.entity.ts`)

Maps a user to a role, with optional org scope limitations:
- `userId` + `roleId` — The assignment pair
- `scopeBranchId` (nullable) — Limits role to one specific branch
- `scopeWarehouseId` (nullable) — Limits role to one specific warehouse
- If both are null → the role applies tenant-wide

### 1.5 `UserPermissionOverrideEntity` (`user/entities/user-permission-override.entity.ts`)

Allows granting or revoking a single permission for one user, overriding their role-level access:
- `permissionCode` — The specific permission
- `isGranted` — `true` = explicit grant, `false` = explicit revoke

### 1.6 `StaffInvitationEntity` (`user/entities/staff-invitation.entity.ts`)

Tracks pending email invitations for staff onboarding:
- `email` — Invitee's email
- `token` — Signed one-time link token (expires after 48 hours)
- `roleId` — Role to auto-assign on acceptance
- `status` (PENDING, ACCEPTED, EXPIRED)

---

## 2. RBAC Permission Resolution Logic

When a user makes an API request, the `PermissionsGuard` resolves their effective permissions using this priority chain:

```
Effective Permission = User Override (if exists) > Role Permissions
```

**Resolution steps:**
1. Load all `UserRoleAssignment` records for the user
2. For each role assignment, load the role's permissions
3. Check for any `UserPermissionOverride` records for the user
4. If override `isGranted=false` → deny even if role grants it
5. If override `isGranted=true` → grant even if no role covers it

---

## 3. Service Layer

| Service | Key Methods |
| :--- | :--- |
| `RoleManagementService` | `createRole()`, `cloneRole()`, `assignPermissions()`, `seedDefaultRoles()` |
| `UserRoleAssignmentService` | `assignRole()` (with optional branch/warehouse scope), `revokeRole()` |
| `UserPermissionOverrideService` | `grantPermission()`, `revokePermission()`, `getUserEffectivePermissions()` |

---

## 4. Guard Chain Execution Order

```
HTTP Request
     │
     ▼
JwtAuthGuard          → verify JWT token, load user from DB
     │
     ▼
SubscriptionGuard     → verify @RequireFeature() decorator against tenant plan
     │
     ▼
PermissionsGuard      → verify @RequirePermission() decorator against effective permissions
     │
     ▼
BranchScopeGuard      → verify user's branchScope covers the requested branchId
     │
     ▼
Controller Method
```

---

## 5. Key API Endpoints

| Method | Path | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Authenticate with email + password, receive JWT |
| `POST` | `/api/auth/refresh` | Exchange refresh token for new access token |
| `POST` | `/api/admin/users/invite` | Send staff invitation email |
| `POST` | `/api/admin/rbac/roles` | Create a new custom role |
| `POST` | `/api/admin/rbac/roles/:id/permissions` | Assign permissions to a role |
| `POST` | `/api/admin/rbac/users/:id/roles` | Assign a role to a staff user (with optional scope) |
| `POST` | `/api/admin/rbac/users/:id/permissions` | Add/revoke a direct permission override |
| `GET` | `/api/admin/rbac/users/:id/permissions` | Get resolved effective permission list |
