import { getServerSession } from "next-auth";
import { authOptions } from "./authOptions";

// Helper to safely get headers
function getHeader(req: any, key: string): string | null {
  if (!req) return null;
  
  // 1. Standard Web Request (Response/Request objects)
  if (typeof req.headers?.get === 'function') {
    return req.headers.get(key);
  }
  
  // 2. Node.js IncomingMessage or NextAuth object
  if (req.headers && typeof req.headers === 'object') {
    const value = req.headers[key] || req.headers[key.toLowerCase()];
    if (Array.isArray(value)) {
      return value[0];
    }
    return value || null;
  }
  
  return null;
}

export async function getTenantId(req?: Request | any): Promise<string | null> {
  console.log("DEBUG_TENANT: Starting getTenantId");

  let host: string | null = null;
  let headerTenantId: string | null = null;

  // 1. Try to get headers from Request object or next/headers (Priority: Domain/Context)
  if (req) {
    host = getHeader(req, "host");
    headerTenantId = getHeader(req, "x-tenant-id");
  } else {
    try {
      const { headers } = await import("next/headers");
      const headerList = await headers();
      host = headerList.get("host");
      headerTenantId = headerList.get("x-tenant-id");
    } catch (e) {
      // Not in a context where headers are available
    }
  }

  console.log("DEBUG_TENANT: Host:", host, "HeaderTenantId:", headerTenantId);

  // 2. Check x-tenant-id header (useful for testing or admin overrides)
  if (headerTenantId) {
    return headerTenantId;
  }

  // 3. Check hostname/subdomain (for public routes)
  if (host) {
    // Remove port if present
    const hostname = host.split(":")[0];
    const protocol = host.includes("localhost") ? "http" : "https";

    // Lookup via API
    try {
        const nestApiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3900/api/v1";
        const apiUrl = `${nestApiUrl}/tenants`;
        
        // Optimistic check: if localhost, might be subdomain
        const parts = hostname.split(".");
        let queryParams = "";
        
        if (parts.length > 1) {
            // We'll pass both domain and subdomain (if applicable)
            queryParams = `?customDomain=${hostname}`;
            
            const subdomain = parts[0];
            if (subdomain !== 'www' && subdomain !== 'api') {
                // If parts.length > 2, it's a subdomain of a domain
                // For localhost testing, usually it's subdomain.localhost
                queryParams += `&subdomain=${subdomain}`;
            }

            const res = await fetch(`${apiUrl}${queryParams}`, {
                cache: 'force-cache',
                next: { revalidate: 60 } // Cache tenant lookup for 60s
            });

            if (res.ok) {
                const data = await res.json();
                if (data.success && data.data?.id) {
                    console.log("DEBUG_TENANT: Found via API:", data.data.id);
                    return data.data.id;
                }
            }
        }
    } catch (err) {
        console.error("DEBUG_TENANT: API lookup failed", err);
    }
  }

  // 4. Check if user is authenticated (Fallback for protected routes or if no domain context)
  // This is now the fallback, so if I visit a store explicitly, I see the store, not my session tenant.
  try {
    const session = await getServerSession(authOptions);
    console.log("DEBUG_TENANT: Session found:", session?.user?.email, "Tenant:", session?.user?.tenantId);
    if (session?.user?.tenantId) {
      return session.user.tenantId;
    }
  } catch (err) {
    console.error("DEBUG_TENANT: Session check failed", err);
  }

  console.log("DEBUG_TENANT: No tenant identified, returning null.");
  return null;
}
