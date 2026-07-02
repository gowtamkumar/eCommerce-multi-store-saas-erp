# Platform Maintenance Mode Architecture Guide

This document is a deep-dive developer guide for the **Platform-Wide Maintenance Mode** feature. It details the step-by-step code implementation, affected files, execution flows, and step-by-step instructions on how to completely remove the feature if needed.

---

## 1. Feature Overview

Maintenance Mode allows a platform administrator (Super Admin) to freeze public storefront and merchant dashboard traffic during system migrations or updates.

- **Bypass Rule**: Authenticated Super Admins and critical auth/routing endpoints (`/login`, `/system`, `/api`, `/platform/settings`, `/stores`, `/settings/public`) bypass the block to allow management and troubleshooting.
- **Storefront & Merchant Rejection**: Any standard store owner, staff member, or guest customer attempting to access the site is blocked both at the API level (returns `503 Service Unavailable`) and at the UI level (displays a custom maintenance screen with a custom warning message).

---

## 2. Affected Files (Code Directory)

The following files contain code related to the Maintenance Mode feature:

### Backend (NestJS Server)
1. **Entity**: [platform-settings.entity.ts](file:///home/gowtamkumar/projects/eCommerce-multi-store-saas/server/src/modules/system/platform/entities/platform-settings.entity.ts) *(Adds database columns)*
2. **DTO**: [platform-settings-response.dto.ts](file:///home/gowtamkumar/projects/eCommerce-multi-store-saas/server/src/modules/system/platform/dto/platform-settings-response.dto.ts) *(Exposes columns to API)*
3. **Repository**: [platform-settings.repository.ts](file:///home/gowtamkumar/projects/eCommerce-multi-store-saas/server/src/modules/system/platform/platform-settings.repository.ts) *(Seeds default values)*
4. **Guard**: [maintenance.guard.ts](file:///home/gowtamkumar/projects/eCommerce-multi-store-saas/server/src/common/guards/maintenance.guard.ts) *(Evaluates tokens & blocks API traffic)*
5. **App Module**: [app.module.ts](file:///home/gowtamkumar/projects/eCommerce-multi-store-saas/server/src/app.module.ts) *(Registers the Guard globally)*

### Client (Next.js App)
6. **Settings Tab & Toggle Dashboard**: [PlatformSetting.tsx](file:///home/gowtamkumar/projects/eCommerce-multi-store-saas/client/features/system/components/PlatformSetting.tsx) *(Adds toggle UI & Dashboard panel)*
7. **Lock Screen Wrapper**: [MaintenanceWrapper.tsx](file:///home/gowtamkumar/projects/eCommerce-multi-store-saas/client/components/shared/MaintenanceWrapper.tsx) *(Blocks UI pages and renders the custom lock screen)*
8. **Root Layout registration**: [layout.tsx](file:///home/gowtamkumar/projects/eCommerce-multi-store-saas/client/app/layout.tsx) *(Injects the lock screen wrapper globally)*

---

## 3. Step-by-Step Code Walkthrough

### Step 1: Database Columns & Defaults
In [platform-settings.entity.ts](file:///home/gowtamkumar/projects/eCommerce-multi-store-saas/server/src/modules/system/platform/entities/platform-settings.entity.ts), two columns store the state:
```typescript
@Column({ name: 'is_maintenance_mode', type: 'boolean', default: false })
isMaintenanceMode: boolean

@Column({ name: 'maintenance_message', type: 'text', nullable: true })
maintenanceMessage: string
```
Default seeds in [platform-settings.repository.ts](file:///home/gowtamkumar/projects/eCommerce-multi-store-saas/server/src/modules/system/platform/platform-settings.repository.ts) populate initial records:
```typescript
isMaintenanceMode: false,
maintenanceMessage: 'Platform is currently undergoing scheduled upgrades. Please try again shortly.',
```

### Step 2: Global Guard Authorization Filter
The [maintenance.guard.ts](file:///home/gowtamkumar/projects/eCommerce-multi-store-saas/server/src/common/guards/maintenance.guard.ts) operates globally on the NestJS backend:
1. **Critical Path Bypass**: If the URL path is auth, login, settings retrieval, or domain lookup, the guard exits immediately (`return true`).
2. **JWT Decoding**: Because global NestJS guards run before controller-level auth guards, the guard parses the raw `Authorization: Bearer <token>` header to extract the user's role.
3. **Role Bypass**: If the role is `SUPER_ADMIN`, the guard returns `true` (bypass).
4. **Maintenance Verification**: Checks `PlatformSettings` table. If `isMaintenanceMode` is active, it throws `ServiceUnavailableException` (HTTP 503).

### Step 3: Client Global Layout Wrapper
In [MaintenanceWrapper.tsx](file:///home/gowtamkumar/projects/eCommerce-multi-store-saas/client/components/shared/MaintenanceWrapper.tsx):
- Performs a query to `/platform/settings`.
- Checks if the current pathname is bypassed (e.g. starts with `/login`, `/system`, `/api`, `/accept-invitation`).
- Evaluates the user's active session. If maintenance mode is `ON` and the user is not a `SUPER_ADMIN`, it replaces the children content with a premium dark-mode lock screen rendering the `maintenanceMessage`.

---

## 4. How to Completely Remove Maintenance Mode

If you wish to remove the Maintenance Mode feature completely from the application, follow these step-by-step instructions to delete the files and strip out references:

### Step 1: Remove the Backend Guard Registration
Open [app.module.ts](file:///home/gowtamkumar/projects/eCommerce-multi-store-saas/server/src/app.module.ts):
- Delete the import:
  ```typescript
  import { MaintenanceGuard } from '@/common/guards/maintenance.guard'
  ```
- Remove the provider block from the `providers` list:
  ```typescript
  // DELETE THIS BLOCK
  {
    provide: APP_GUARD,
    useClass: MaintenanceGuard,
  },
  ```

### Step 2: Delete the Guard File
- Delete [maintenance.guard.ts](file:///home/gowtamkumar/projects/eCommerce-multi-store-saas/server/src/common/guards/maintenance.guard.ts) from the server files directory.

### Step 3: Remove Database Columns & DTO Fields
- In [platform-settings.entity.ts](file:///home/gowtamkumar/projects/eCommerce-multi-store-saas/server/src/modules/system/platform/entities/platform-settings.entity.ts), delete:
  ```typescript
  @Column({ name: 'is_maintenance_mode', type: 'boolean', default: false })
  isMaintenanceMode: boolean

  @Column({ name: 'maintenance_message', type: 'text', nullable: true })
  maintenanceMessage: string
  ```
- In [platform-settings-response.dto.ts](file:///home/gowtamkumar/projects/eCommerce-multi-store-saas/server/src/modules/system/platform/dto/platform-settings-response.dto.ts), delete the fields:
  ```typescript
  @Expose()
  isMaintenanceMode: boolean

  @Expose()
  maintenanceMessage: string
  ```
- In [platform-settings.repository.ts](file:///home/gowtamkumar/projects/eCommerce-multi-store-saas/server/src/modules/system/platform/platform-settings.repository.ts), delete seed initializers:
  ```typescript
  isMaintenanceMode: false,
  maintenanceMessage: 'Platform is currently undergoing scheduled upgrades...',
  ```

### Step 4: Remove settings page toggles
Open [PlatformSetting.tsx](file:///home/gowtamkumar/projects/eCommerce-multi-store-saas/client/features/system/components/PlatformSetting.tsx):
- Remove the toggle card from the `System & Cache` tab view (lines ~435-465).
- Remove the visual indicators/quick toggles from the `Dashboard` tab view (lines ~168-204 and lines ~260-272).

### Step 5: Remove the Frontend Wrapper & Layout Registration
- Delete [MaintenanceWrapper.tsx](file:///home/gowtamkumar/projects/eCommerce-multi-store-saas/client/components/shared/MaintenanceWrapper.tsx).
- Open [layout.tsx](file:///home/gowtamkumar/projects/eCommerce-multi-store-saas/client/app/layout.tsx):
  - Delete import:
    ```typescript
    import MaintenanceWrapper from "@/components/shared/MaintenanceWrapper";
    ```
  - Remove wrapper tags enclosing `{children}`:
    ```diff
    - <MaintenanceWrapper>
    -   {children}
    - </MaintenanceWrapper>
    + {children}
    ```

---

## 5. Dev Verification Commands
Run compiler audits after modifying or removing code to confirm compilation integrity:
```bash
# Verify client next.js
docker exec multi_store_client_dev npx tsc --noEmit

# Verify server nestjs
docker exec multi_store_server_dev npx tsc --noEmit

# Run unit tests
docker exec multi_store_server_dev npm run test
```
