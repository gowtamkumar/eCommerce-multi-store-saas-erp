import dbConnect from "@/lib/mongodb";
import { getTenantId } from "@/lib/tenant";
import Product from "@/models/Product";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await dbConnect();
    const tenantId = await getTenantId(req);
    const { slug } = await params;

    if (!tenantId) {
       return NextResponse.json(
        { success: false, error: "Tenant context not found" },
        { status: 400 }
      );
    }

    const product = await Product.findOne({ slug, tenantId }).lean();

    if (!product) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, product });
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}
