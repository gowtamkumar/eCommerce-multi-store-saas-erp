const TENANT_ID_STORAGE_KEY = "store_tenant_id";

let cachedTenantId: string | null = null;

/** Client-side tenant id from settings SSR/hydration (used when hostname lookup fails on localhost). */
export function getClientTenantId(): string | null {
  if (cachedTenantId) {
    return cachedTenantId;
  }

  if (typeof window === "undefined") {
    return null;
  }

  cachedTenantId = localStorage.getItem(TENANT_ID_STORAGE_KEY);
  return cachedTenantId;
}

export function setClientTenantId(tenantId: string | null | undefined): void {
  if (!tenantId) {
    return;
  }

  cachedTenantId = tenantId;

  if (typeof window !== "undefined") {
    localStorage.setItem(TENANT_ID_STORAGE_KEY, tenantId);
  }
}
