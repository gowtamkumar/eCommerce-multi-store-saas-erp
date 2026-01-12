import { authOptions } from "@/lib/authOptions";
import dbConnect from "@/lib/mongodb";
import Tenant from "@/models/Tenant";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    // Only allow admin to list tenants
    // NOTE: In a real multi-tenant app, you might not want to expose this publicly 
    // without strict super-admin checks. Assuming role='admin' implies super-admin or tenant-admin.
    // For now, we'll assume only authenticated users can see their own tenant, 
    // OR if Admin role is global, they can see all. Usually 'admin' is scoped to tenant.
    // For this bootstrap implementation, let's allow fetching tenant details based on domain query.

    await dbConnect();

    // If super admin logic exists, list all. OTHERWISE, list current tenant.
    // Currently, we don't have a specific "Super Admin".
    // Let's implement public domain check.

    const { searchParams } = new URL(req.url);
    const domain = searchParams.get("domain");

    if (domain) {
      const tenant = await Tenant.findOne({
        $or: [{ customDomain: domain }, { subdomain: domain }]
      });
      if (!tenant) {
        return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
      }
      return NextResponse.json({ tenant });
    }

    // If authenticated super admin, list all tenants
    if (session?.user?.role === 'SuperAdmin') {
      const tenants = await Tenant.find().sort({ createdAt: -1 });
      return NextResponse.json({ tenants });
    }

    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch tenants" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    // This endpoint should probably be protected or public for sign-ups.
    // Let's assume public sign-up for now.

    await dbConnect();
    const body = await req.json();

    // Check availability
    const checks: any[] = [{ subdomain: body.subdomain }];
    if (body.customDomain) {
      checks.push({ customDomain: body.customDomain });
    }

    const existing = await Tenant.findOne({
      $or: checks
    });


    if (existing) {
      return NextResponse.json(
        { error: "Subdomain or Custom Domain already taken" },
        { status: 400 }
      );
    }

    const tenant = await Tenant.create({
      storeName: body.storeName,
      subdomain: body.subdomain,
      customDomain: body.customDomain,
      planTier: body.planTier || "basic",
    });

    return NextResponse.json({ tenant }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create tenant" },
      { status: 500 }
    );
  }
}
