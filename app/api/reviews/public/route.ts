import { getTenantId } from "@/app/api/utils/getTenantId";
import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product";
import Review from "@/models/Review";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    await dbConnect();
    const tenantId = await getTenantId(req);

    if (!tenantId) {
      return NextResponse.json({ error: "Tenant context missing" }, { status: 400 });
    }

    // Find active product for THIS tenant
    const activeProduct = await Product.findOne({ status: "active", tenantId });

    if (!activeProduct) {
      // If no active product, maybe return empty?
      // Original logic relied on finding ANY active product.
      // Let's keep logic but scoped.
    }

    // Fetch latest 10 approved reviews for THIS tenant
    // Original query: Review.find({ status: "approved" }).where("productId").equals(activeProduct?.id)
    // If activeProduct is null, this query likely returns nothing or errors.

    // Better query: Find reviews for tenant, optionally filtered by product if that was the intent.
    // The original intent seemed to be "Show reviews for the 'main' active product".
    // Let's assume we want reviews for the tenant's active product(s).

    const reviews = await Review.find({ status: "approved", tenantId })
      .where("productId")
      .equals(activeProduct?.id)
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("productId", "name images");

    return NextResponse.json({
      reviews,
      reviewSectionType: activeProduct?.reviewSectionType || 'testimonials'
    });
  } catch (error) {
    console.error("GET public reviews error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
