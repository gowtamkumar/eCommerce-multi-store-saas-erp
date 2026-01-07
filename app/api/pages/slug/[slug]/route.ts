import { getTenantId } from "@/app/api/utils/getTenantId";
import dbConnect from "@/lib/mongodb";
import Page from "@/models/Page";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await dbConnect();
    // Pass req to getTenantId to ensure we extract headers correctly in API context
    const tenantId = await getTenantId(req);
    const { slug } = await params;

    // Query based on tenantId if present, otherwise search without tenant context (SaaS page)
    const query: any = { slug, status: "published" };
    
    if (tenantId) {
      query.tenantId = tenantId;
    } else {
      // For SaaS pages, we might look for pages with no tenantId
      query.tenantId = { $exists: false };
    }

    const page = await Page.findOne(query).lean();

    if (!page) {
      return NextResponse.json(
        { success: false, error: "Page not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, page });
  } catch (error) {
    console.error("Error fetching page:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch page" },
      { status: 500 }
    );
  }
}
