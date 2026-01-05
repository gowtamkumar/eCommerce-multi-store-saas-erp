import dbConnect from "@/lib/mongodb";
import { getTenantId } from "@/lib/tenant";
import Review from "@/models/Review";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await params;
    await dbConnect();
    const tenantId = await getTenantId(req);

    if (!tenantId) {
        return NextResponse.json({ error: "Tenant context missing" }, { status: 400 });
    }
    
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    
    // Ensure we scope by tenantId as well
    const query: any = { productId, tenantId };
    if (status) query.status = status;

    const reviews = await Review.find(query).sort({ createdAt: -1 });
    return NextResponse.json({ reviews });
  } catch (error) {
    console.error("GET reviews error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await params;
    const body = await req.json();
    await dbConnect();
    const tenantId = await getTenantId(req);

    if (!tenantId) {
        return NextResponse.json({ error: "Tenant context missing" }, { status: 400 });
    }

    const review = await Review.create({
      ...body,
      productId,
      tenantId, // Scoped to tenant
      status: 'pending' // Default to pending for moderation
    } as any);

    return NextResponse.json({ review }, { status: 201 });
  } catch (error) {
    console.error("POST review error:", error);
    return NextResponse.json(
      { error: "Failed to create review" },
      { status: 500 }
    );
  }
}
