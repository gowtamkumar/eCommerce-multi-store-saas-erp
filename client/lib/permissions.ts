import type { AdminNavItem, AdminNavGroup } from '@/routes'
import { navGroups, storeSettings, uiSettings } from '@/routes'
import { getFeaturesForPermission } from '@/lib/feature-mapping'

export interface PermissionManifest {
  featuresEnabled: string[]
  permissions: string[]
}

export function hasPermission(
  manifest: PermissionManifest | null | undefined,
  permission: string,
): boolean {
  if (!manifest?.permissions?.length) return false
  return manifest.permissions.includes(permission)
}

export function hasAnyPermission(
  manifest: PermissionManifest | null | undefined,
  permissions: string[],
): boolean {
  return permissions.some((p) => hasPermission(manifest, p))
}

/** Store owner / RBAC Super Admin — full sidebar within plan features. */
export function hasFullStoreAccess(manifest: PermissionManifest | null | undefined): boolean {
  if (!manifest?.permissions?.length) return false
  return (
    hasPermission(manifest, 'settings:manage') &&
    hasPermission(manifest, 'users:assign-roles')
  )
}

export function isCustomerRole(role: string | undefined): boolean {
  return (role || '').toLowerCase() === 'user'
}

/** Authenticated staff (not storefront customer). RBAC manifest controls in-app access. */
export function isStaffRole(role: string | undefined): boolean {
  return Boolean(role) && !isCustomerRole(role)
}

/** Plan features for UI gating — prefer RBAC manifest over raw JWT plan list. */
export function getEffectiveFeatures(
  manifest: PermissionManifest | null | undefined,
  sessionFeatures: string[] = [],
  tokenFeatures: string[] = [],
): string[] {
  if (manifest?.featuresEnabled?.length) {
    return manifest.featuresEnabled
  }
  if (sessionFeatures.length > 0) return sessionFeatures
  if (tokenFeatures.length > 0) return tokenFeatures
  return []
}

/** Granted RBAC slugs from login `permissionManifest`. */
export function getGrantedPermissions(
  manifest: PermissionManifest | null | undefined,
): string[] {
  return manifest?.permissions ?? []
}

export function getGrantedFeatures(
  manifest: PermissionManifest | null | undefined,
): string[] {
  return manifest?.featuresEnabled ?? []
}

export function resolveNavItemPermission(item: AdminNavItem): string | string[] | null {
  if (item.permissions?.length) return item.permissions
  if (item.permission) return item.permission
  return null
}

/** Plan feature for a nav item — explicit `feature` or derived from RBAC permission slug. */
export function resolveNavItemFeature(item: AdminNavItem): string | undefined {
  if (item.feature) return item.feature
  const required = resolveNavItemPermission(item)
  if (!required) return undefined
  const slug = Array.isArray(required) ? required[0] : required
  const [primary, plan] = getFeaturesForPermission(slug)
  return plan ?? primary
}

export function hasFeatureInManifest(
  manifest: PermissionManifest | null | undefined,
  feature: string | undefined,
): boolean {
  if (!feature || !manifest?.featuresEnabled?.length) return true
  return manifest.featuresEnabled.includes(feature)
}

export function canAccessNavItem(
  manifest: PermissionManifest | null | undefined,
  item: AdminNavItem,
  options: { isSuperAdmin: boolean; isFullAccess: boolean },
): boolean {
  const itemFeature = resolveNavItemFeature(item)
  if (!hasFeatureInManifest(manifest, itemFeature)) return false

  const required = resolveNavItemPermission(item)
  if (!required) return true

  const slugs = Array.isArray(required) ? required : [required]
  const featureOk = slugs.some((slug) => {
    const feature = resolveNavItemFeature({ ...item, permission: slug })
    return hasFeatureInManifest(manifest, feature)
  })
  if (!featureOk) return false

  if (options.isSuperAdmin || options.isFullAccess) return true

  if (Array.isArray(required)) return hasAnyPermission(manifest, required)
  return hasPermission(manifest, required)
}

function isNavigableItem(item: AdminNavItem): item is AdminNavItem & { href: string } {
  return Boolean(item.href && item.type !== 'header')
}

/** Flatten all nav items with href + permission for route guards. */
export function getAllNavRoutePermissions(): Array<{
  href: string
  permission?: string
  permissions?: string[]
}> {
  const items: Array<{ href: string; permission?: string; permissions?: string[] }> = []

  const collect = (list: AdminNavItem[]) => {
    for (const item of list) {
      if (!isNavigableItem(item)) continue
      items.push({
        href: item.href,
        permission: item.permission,
        permissions: item.permissions,
      })
    }
  }

  for (const group of navGroups as AdminNavGroup[]) {
    collect(group.items)
  }
  collect(storeSettings as AdminNavItem[])
  collect(uiSettings as AdminNavItem[])

  return items
}

export function canAccessRoute(
  pathname: string,
  manifest: PermissionManifest | null | undefined,
  options: { isSuperAdmin: boolean; isFullAccess: boolean },
): boolean {
  const routes = getAllNavRoutePermissions().sort((a, b) => b.href.length - a.href.length)

  for (const route of routes) {
    if (pathname === route.href || pathname.startsWith(`${route.href}/`)) {
      return canAccessNavItem(manifest, route, options)
    }
  }

  return true
}

/** First admin route the user may open (e.g. HRM-only → `/admin/hrm/dashboard`). */
export function getFirstAccessibleAdminRoute(
  manifest: PermissionManifest | null | undefined,
  options: { isSuperAdmin: boolean; isFullAccess: boolean },
): string {
  if (options.isSuperAdmin) return '/admin'

  const routes = getAllNavRoutePermissions()

  for (const feature of manifest?.featuresEnabled ?? []) {
    const prefix = `/admin/${feature}`
    const match = routes.find(
      (route) =>
        route.href.startsWith(prefix) &&
        canAccessNavItem(manifest, route, options),
    )
    if (match) return match.href
  }

  for (const route of routes) {
    if (route.href === '/admin') continue
    if (canAccessNavItem(manifest, route, options)) return route.href
  }

  for (const route of routes) {
    if (canAccessNavItem(manifest, route, options)) return route.href
  }

  return '/admin'
}
