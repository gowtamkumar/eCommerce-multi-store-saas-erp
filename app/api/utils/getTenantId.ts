import dbConnect from "@/lib/mongodb";
import Tenant from "@/models/Tenant";

export async function getTenantId(req: Request): Promise<string | null> {
    await dbConnect();

    // 1. Check header x-tenant-id
    const headerTenantId = req.headers.get("x-tenant-id");
    if (headerTenantId) return headerTenantId;

    // 2. Check host
    const host = req.headers.get("host");
    if (!host) return null;

    const hostname = host.split(":")[0];

    // Custom Domain
    // Optimization: In a real app, cache this
    const customDomainTenant = await Tenant.findOne({ customDomain: hostname });
    if (customDomainTenant) return customDomainTenant.id.toString();

    // Subdomain
    const parts = hostname.split(".");
    if (parts.length > 1) {
        const subdomain = parts[0];
        if (subdomain !== 'www' && subdomain !== 'api') {
            const subdomainTenant = await Tenant.findOne({ subdomain });
            if (subdomainTenant) return subdomainTenant.id.toString();
        }
    }

    return null;
}
