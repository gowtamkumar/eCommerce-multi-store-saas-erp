import { getTenantId } from "@/app/api/utils/getTenantId";
import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await dbConnect();
    const tenantId = await getTenantId(req);

    if (!tenantId) {
        return NextResponse.json({ error: "Tenant context missing" }, { status: 400 });
    }

    // Ensure product belongs to tenant
    const product = await Product.findOne({ _id: id, tenantId } as any);
    if (!product)
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    return NextResponse.json({ product });
  } catch (error) {
    console.error("GET product error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await dbConnect();
    const tenantId = await getTenantId(req);

    if (!tenantId) {
        return NextResponse.json({ error: "Tenant context missing" }, { status: 400 });
    }

    const body = await req.json();


    const updateData = {
      ...body,
      tagline: body.tagline,
      socialProof: body.socialProof,
      heroHighlights: body.heroHighlights,
      keyBenefits: body.keyBenefits,
      specifications: body.specifications,
      videoUrl: body.videoUrl,
      releaseBadgeText: body.releaseBadgeText,
      sections: body.sections,
      reviewSectionType: body.reviewSectionType,
    };
    console.log("Update Data:", JSON.stringify(updateData, null, 2)); // Debug log

    // Ensure we only update if it belongs to tenant
    const product = await Product.findOneAndUpdate({ _id: id, tenantId } as any, updateData, {
      new: true,
    });

    console.log("Updated Product:", JSON.stringify(product, null, 2)); // Debug log

    if (!product)
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    return NextResponse.json({ product });
  } catch (error) {
    console.error("PUT product error:", error);
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await dbConnect();
    const tenantId = await getTenantId(req);

    if (!tenantId) {
        return NextResponse.json({ error: "Tenant context missing" }, { status: 400 });
    }
    
    // Ensure we only delete if it belongs to tenant
    const product = await Product.findOneAndDelete({ _id: id, tenantId } as any);
    if (!product)
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE product error:", error);
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
}
