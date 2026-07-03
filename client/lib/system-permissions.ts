import type { PermissionManifest } from '@/lib/permissions'

/**
 * User's granted RBAC permission slugs from login /auth/me `permissionManifest`.
 * This is the runtime source of truth — not a static client enum.
 */
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

export function hasGrantedPermission(
  manifest: PermissionManifest | null | undefined,
  permission: string,
): boolean {
  return getGrantedPermissions(manifest).includes(permission)
}

export function hasAnyGrantedPermission(
  manifest: PermissionManifest | null | undefined,
  permissions: string[],
): boolean {
  const granted = new Set(getGrantedPermissions(manifest))
  return permissions.some((p) => granted.has(p))
}
