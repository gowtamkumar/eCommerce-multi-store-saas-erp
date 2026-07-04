"use client";

import { useSession } from "next-auth/react";
import { useMemo } from "react";
import { UserRole } from "@/lib/enums/user-role.enum";
import {
  canAccessNavItem,
  canAccessRoute,
  getGrantedFeatures,
  getGrantedPermissions,
  getFirstAccessibleAdminRoute,
  hasFullStoreAccess,
  hasPermission,
  hasAnyPermission,
  hasFeatureInManifest,
  resolveNavItemFeature,
  isStaffRole,
  type PermissionManifest,
} from "@/lib/permissions";

export function usePermissions() {
  const { data: session } = useSession();

  return useMemo(() => {
    const role = (session?.user?.role || "").toLowerCase() as UserRole;
    const features = session?.user?.features || [];
    const manifest: PermissionManifest | null =
      session?.user?.permissionManifest ?? null;

    const isSuperAdmin =
      role === UserRole.SUPER_ADMIN || features.includes("*");
    const isFullAccess = isSuperAdmin || hasFullStoreAccess(manifest);

    return {
      role,
      features: manifest?.featuresEnabled?.length
        ? manifest.featuresEnabled
        : features,
      /** From login permissionManifest — user's granted RBAC slugs */
      permissions: getGrantedPermissions(manifest),
      featuresEnabled: getGrantedFeatures(manifest),
      manifest,
      isSuperAdmin,
      isFullAccess,
      isStaff: isStaffRole(role),
      hasPermission: (permission: string) => {
        const feature = resolveNavItemFeature({ permission });
        if (!hasFeatureInManifest(manifest, feature)) return false;
        return isSuperAdmin || isFullAccess || hasPermission(manifest, permission);
      },
      hasAnyPermission: (permissions: string[]) => {
        const validPermissions = permissions.filter((p) => {
          const feature = resolveNavItemFeature({ permission: p });
          return hasFeatureInManifest(manifest, feature);
        });
        if (validPermissions.length === 0) return false;
        return isSuperAdmin || isFullAccess || hasAnyPermission(manifest, validPermissions);
      },
      canAccessNavItem: (item: {
        permission?: string;
        permissions?: string[];
        feature?: string;
      }) =>
        canAccessNavItem(manifest, item, { isSuperAdmin, isFullAccess }),
      canAccessRoute: (pathname: string) =>
        canAccessRoute(pathname, manifest, { isSuperAdmin, isFullAccess }),
      firstAccessibleRoute: getFirstAccessibleAdminRoute(manifest, {
        isSuperAdmin,
        isFullAccess,
      }),
    };
  }, [
    session?.user?.role,
    session?.user?.features,
    session?.user?.permissionManifest,
  ]);
}
