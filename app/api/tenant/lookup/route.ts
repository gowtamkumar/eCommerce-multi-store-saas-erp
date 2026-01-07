import dbConnect from "@/lib/mongodb";
import Tenant from "@/models/Tenant";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const domain = searchParams.get("domain");
    const subdomain = searchParams.get("subdomain");

    if (domain) {
      const customDomainTenant = await Tenant.findOne({ customDomain: domain });
      if (customDomainTenant) {
        return NextResponse.json({ success: true, tenantId: customDomainTenant._id.toString() });
      }
    }

    if (subdomain) {
      const subdomainTenant = await Tenant.findOne({ subdomain });
      if (subdomainTenant) {
        return NextResponse.json({ success: true, tenantId: subdomainTenant._id.toString() });
      }
    }

    return NextResponse.json({ success: false, error: "Tenant not found" }, { status: 404 });
  } catch (error) {
    console.error("Error looking up tenant:", error);
    return NextResponse.json(
      { success: false, error: "Failed to lookup tenant" },
      { status: 500 }
    );
  }
}
