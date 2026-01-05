import dbConnect from "@/lib/mongodb";
import { getTenantId } from "@/lib/tenant";
import Product from "@/models/Product";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    await dbConnect();
    const tenantId = await getTenantId(req);

    if (!tenantId) {
        return NextResponse.json({ error: "Tenant context missing" }, { status: 400 });
    }

    const products = await Product.find({ tenantId });
    return NextResponse.json({ products });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    await dbConnect();
    const tenantId = await getTenantId(req);

    if (!tenantId) {
        return NextResponse.json({ error: "Tenant context missing" }, { status: 400 });
    }

    const body = await req.json();

    const product = await Product.create({
      ...body,
      tenantId, // Force tenant scope
      tagline: body.tagline,
      socialProof: body.socialProof,
      heroHighlights: body.heroHighlights,
      keyBenefits: body.keyBenefits,
      specifications: body.specifications,
      videoUrl: body.videoUrl,
      releaseBadgeText: body.releaseBadgeText,
      sections: body.sections,
      reviewSectionType: body.reviewSectionType,
    });

    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}
