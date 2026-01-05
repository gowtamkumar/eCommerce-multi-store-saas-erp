import Tenant from "@/models/Tenant";
import { getServerSession } from "next-auth";
import { authOptions } from "./authOptions";
import dbConnect from "./mongodb";

export async function getTenantId(req?: Request): Promise<string | null> {
  await dbConnect();

  // 1. Check if user is authenticated (most reliable for protected routes)
  const session = await getServerSession(authOptions);
  if (session?.user?.tenantId) {
    return session.user.tenantId;
  }

  // 2. Check x-tenant-id header (useful for testing or admin overrides)
  if (req) {
    const headerTenantId = req.headers.get("x-tenant-id");
    if (headerTenantId) {
      return headerTenantId;
    }
  }

  // 3. Check hostname/subdomain (for public routes)
  if (req) {
    const host = req.headers.get("host");
    if (host) {
      // Remove port if present
      const hostname = host.split(":")[0];
      
      // Check for custom domain
      const customDomainTenant = await Tenant.findOne({ customDomain: hostname });
      if (customDomainTenant) {
        return customDomainTenant._id.toString();
      }

      // Check for subdomain
      // Assuming localhost or domain.com structure. 
      // Need to define base domain. For now, simplistic splitting.
      // e.g., store1.saas.com -> store1
      const parts = hostname.split(".");
      if (parts.length > 1) { // Basic check, might need env var for BASE_DOMAIN
        const subdomain = parts[0];
         // exclude 'www', 'api', etc if needed, or just query
        const subdomainTenant = await Tenant.findOne({ subdomain });
        if (subdomainTenant) {
           return subdomainTenant._id.toString();
        }
      }
    }
  }

  return null;
}
