import nestApiUrl from "../lib/api-url";
import { getClientTenantId, setClientTenantId } from "../lib/store-tenant-id";

let cachedTenantId: string | null = null;
let tenantLookupPromise: Promise<string | null> | null = null;

// Helper to safely get headers
function getHeader(req: any, key: string): string | null {
  if (!req) return null;

  // 1. Standard Web Request (Response/Request objects)
  if (typeof req.headers?.get === "function") {
    return req.headers.get(key);
  }

  // 2. Node.js IncomingMessage or NextAuth object
  if (req.headers && typeof req.headers === "object") {
    const value = req.headers[key] || req.headers[key.toLowerCase()];
    if (Array.isArray(value)) {
      return value[0];
    }
    return value || null;
  }

  return null;
}

export async function getTenantId(
  req?: Request | any,
  allowSessionFallback = false,
): Promise<string | null> {
  const isClient = typeof window !== "undefined";

  // 1. Client-side resolution
  if (isClient) {
    if (cachedTenantId) return cachedTenantId;

    const storedId = getClientTenantId();
    if (storedId) {
      cachedTenantId = storedId;
      return storedId;
    }

    if (tenantLookupPromise) return tenantLookupPromise;

    const hostname = window.location.hostname;
    if (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === "gowtam.com" ||
      hostname === "www.gowtam.com" ||
      hostname === "api.gowtam.com"
    ) {
      return null;
    }

    tenantLookupPromise = (async () => {
      try {
        const parts = hostname.split(".");
        let queryParams = `?customDomain=${hostname}`;

        if (parts.length > 1) {
          const subdomain = parts[0];
          if (subdomain !== "www" && subdomain !== "api") {
            queryParams += `&subdomain=${subdomain}`;
          }
        }

        const res = await fetch(`${nestApiUrl}/tenants${queryParams}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.data?.id) {
            const tenantId = data.data.id;
            cachedTenantId = tenantId;
            setClientTenantId(tenantId);
            return tenantId;
          }
        }
      } catch (e) {
        console.error("DEBUG_TENANT: Client-side lookup failed", e);
      } finally {
        tenantLookupPromise = null;
      }
      return null;
    })();

    return tenantLookupPromise;
  }

  // 2. Server-side resolution (ALWAYS per-request)
  let host: string | null = null;
  let headerTenantId: string | null = null;

  // Try to get headers from Request object or next/headers
  if (req) {
    host = getHeader(req, "host");
    headerTenantId = getHeader(req, "x-tenant-id");
  } else {
    try {
      // Dynamic import next/headers so it is never statically compiled/bundled for the browser
      const { headers } = await import("next/headers");
      const headerList = await headers();
      host = headerList.get("host");
      headerTenantId = headerList.get("x-tenant-id");
    } catch (e) {
      // Not in a context where headers are available
    }
  }

  // Check x-tenant-id header
  if (headerTenantId) {
    return headerTenantId;
  }

  // Check hostname/subdomain
  if (host) {
    const hostname = host.split(":")[0];

    // Explicitly check for SaaS root domains on server
    if (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === "gowtam.com" ||
      hostname === "www.gowtam.com" ||
      hostname === "api.gowtam.com"
    ) {
      return null;
    }

    try {
      const parts = hostname.split(".");
      let queryParams = "";

      if (parts.length > 1) {
        queryParams = `?customDomain=${hostname}`;
        const subdomain = parts[0];
        if (subdomain !== "www" && subdomain !== "api") {
          queryParams += `&subdomain=${subdomain}`;
        }

        const res = await fetch(`${nestApiUrl}/tenants${queryParams}`, {
          cache: "no-store",
        });

        if (res.ok) {
          const data = await res.json();
          if (data.success && data.data?.id) {
            return data.data.id;
          }
        }
      }
    } catch (err) {
      console.error("DEBUG_TENANT: Server-side API lookup failed", err);
    }
  }

  // Check session (Fallback)
  if (allowSessionFallback) {
    try {
      const { getServerSession } = await import("next-auth");
      const { authOptions } = await import("@/lib/authOptions");
      const session = await getServerSession(authOptions);
      if (session?.user?.tenantId) {
        return session.user.tenantId;
      }
    } catch (err) {
      // console.error("DEBUG_TENANT: Session check failed", err);
    }
  }

  return null;
}
