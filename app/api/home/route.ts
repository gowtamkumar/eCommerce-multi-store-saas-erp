import { getTenantId } from "@/app/api/utils/getTenantId";
import dbConnect from "@/lib/mongodb";
import Page from "@/models/Page";
import Product from "@/models/Product";
import SiteSettings from "@/models/SiteSettings";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    await dbConnect();
    const tenantId = await getTenantId(req);

    // If no tenant is identified, we are on the root SaaS marketing domain
    if (!tenantId) {
       return NextResponse.json({ success: true, isSaaS: true });
    }

    const [product, dynamicPage, settingsData] = await Promise.all([
       Product.findOne({ status: "active", tenantId }).sort({ createdAt: -1 }).lean(),
       Page.findOne({ tenantId, isHomePage: true }).lean(),
       SiteSettings.findOne({ tenantId }).lean()
    ]);

    const settings = settingsData || {
        logo: "",
        brandName: "LuxeAudio",
        siteDescription: "Elevating your audio experience with premium sound and design.",
        contactEmail: "support@luxeaudio.com",
        socialLinks: { facebook: "", twitter: "", instagram: "", linkedin: "" },
        productMode: "single",
        marketing: { googleAnalyticsId: "", googleSiteVerification: "", facebookPixelId: "", facebookDomainVerification: "" }
    };

    return NextResponse.json({
        success: true,
        isSaaS: false,
        product,
        dynamicPage,
        settings
    });

  } catch (error) {
    console.error("Error fetching home data:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch home data" },
      { status: 500 }
    );
  }
}
