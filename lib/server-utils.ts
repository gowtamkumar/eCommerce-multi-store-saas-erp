import { headers } from "next/headers";
import { fetchAPI } from "./api";

export async function resolveTenantId(): Promise<string | null> {
    const headersList = await headers();
    // 1. Check existing header (if proxied)
    const headerId = headersList.get("x-tenant-id");
    if (headerId) return headerId;

    const host = headersList.get("host");
    if (!host) return null;

    const hostname = host.split(":")[0];
    
    // Lookup via API
    try {
        const lookupRes = await fetchAPI(`/tenant/lookup?domain=${hostname}`);
        if (lookupRes.success) return lookupRes.tenantId;
    } catch {}

    // Subdomain
    const parts = hostname.split(".");
    if (parts.length > 1) {
        const subdomain = parts[0];
        if (subdomain !== 'www' && subdomain !== 'api') {
            try {
                const subRes = await fetchAPI(`/tenant/lookup?subdomain=${subdomain}`);
                if (subRes.success) return subRes.tenantId;
            } catch {}
        }
    }
    return null;
}
