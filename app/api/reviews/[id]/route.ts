import dbConnect from "@/lib/mongodb";
import { getTenantId } from "@/lib/tenant";
import Review from "@/models/Review";
import { NextResponse } from "next/server";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json(); // Changed from { status } to body
    await dbConnect();
    const tenantId = await getTenantId(req);

    if (!tenantId) {
        return NextResponse.json({ error: "Tenant context missing" }, { status: 400 });
    }

    // Ensure update is scoped to tenant
    const review = await Review.findOneAndUpdate(
      { _id: id, tenantId } as any,
      body, // Changed from { status } to body
      { new: true, runValidators: true } // Added runValidators: true
    );

    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    return NextResponse.json({ review });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update review" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect(); // Moved up
    const tenantId = await getTenantId(req);

    if (!tenantId) {
        return NextResponse.json({ error: "Tenant context missing" }, { status: 400 });
    }

    const { id } = await params; // Moved down
    // ensure deletion is scoped to tenant
    const review = await Review.findOneAndDelete({ _id: id, tenantId } as any);

    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete review" },
      { status: 500 }
    );
  }
}
