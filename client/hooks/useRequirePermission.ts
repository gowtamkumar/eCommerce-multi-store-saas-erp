"use client";

import { useEffect, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { usePermissions } from "./usePermissions";
import { getFirstAccessibleAdminRoute } from "@/lib/permissions";

/**
 * Redirects when the current user lacks permission for the active route.
 * Uses login `permissionManifest` (permissions + featuresEnabled).
 */
export function useRequirePermission(fallback?: string) {
  const pathname = usePathname();
  const router = useRouter();
  const { canAccessRoute, manifest, isSuperAdmin, isFullAccess } = usePermissions();

  const defaultFallback = useMemo(
    () =>
      fallback ??
      getFirstAccessibleAdminRoute(manifest, { isSuperAdmin, isFullAccess }),
    [fallback, manifest, isSuperAdmin, isFullAccess],
  );

  useEffect(() => {
    if (!pathname?.startsWith("/admin")) return;
    if (isSuperAdmin) return;
    if (!manifest && pathname !== "/admin") return;

    if (!canAccessRoute(pathname)) {
      router.replace(defaultFallback);
    }
  }, [
    pathname,
    canAccessRoute,
    manifest,
    isSuperAdmin,
    router,
    defaultFallback,
  ]);
}
