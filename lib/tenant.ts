import Tenant from "@/models/Tenant";
import { getServerSession } from "next-auth";
import { authOptions } from "./authOptions";
import dbConnect from "./mongodb";

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
  await dbConnect();

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

    // Check for custom domain
    // Optimization: Cache this lookup if possible
    console.log("DEBUG_TENANT: Looking up custom domain:", hostname);
    const customDomainTenant = await Tenant.findOne({ customDomain: hostname });
    if (customDomainTenant) {
      console.log("DEBUG_TENANT: Found by Custom Domain", hostname);
      return customDomainTenant._id.toString();
    } else {
      console.log("DEBUG_TENANT: Tenant not found for custom domain:", hostname);
    }

    // Check for subdomain
    // Assuming localhost or domain.com structure.
    // e.g., store1.saas.com -> store1
    // e.g., store1.localhost -> store1
    const parts = hostname.split(".");

    // Logic: If on localhost, looks like [subdomain, localhost] (length 2)
    // If on prod (saas.com), looks like [subdomain, saas, com] (length 3)
    // If just localhost, length 1 (no subdomain)

    // We want to extract the first part if it's a subdomain
    if (parts.length > 1) {
      // For localhost, we expect at least 2 parts (sub.localhost)
      // For prod, we might expect 3 (sub.domain.com) OR we treat the root domain differently

      // Simple heuristic: take the first part as subdomain
      const subdomain = parts[0];

      // Exclude common reserved subdomains or 'www'
      if (subdomain !== 'www' && subdomain !== 'api') {
        console.log("DEBUG_TENANT: Looking up subdomain:", subdomain);
        const subdomainTenant = await Tenant.findOne({ subdomain });
        if (subdomainTenant) {
          console.log("DEBUG_TENANT: Found by Subdomain", subdomain, subdomainTenant._id);
          console.log("DEBUG_TENANT: Returning tenantId from subdomain:", subdomainTenant._id.toString());
          return subdomainTenant._id.toString();
        } else {
          console.log("DEBUG_TENANT: Tenant not found for subdomain", subdomain);
        }
      }
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
