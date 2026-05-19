import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import PaymentStatus from "@/components/shared/PaymentStatus";
import RecentlyViewedProducts from "@/components/shared/RecentlyViewedProducts";
import SectionRenderer from "@/features/admin/pages/components/customizer/SectionRenderer";
import SaaSLanding from "@/features/system/components/SaaSLanding";
import { fetchAPI } from "@/services/api";
import { getSiteSettings } from "@/services/getSettings";
import { getTenantId } from "@/services/tenant";
import { Suspense } from "react";

// ISR: Regenerate the home page at most once every 60 seconds.
// This avoids a full SSR on every request while keeping content fresh.
export const revalidate = 60;

/** Build inline CSS vars for page typography settings. */
function buildTypographyStyle(typography: Record<string, any>): React.CSSProperties {
  return {
    fontFamily: typography?.fontFamily || 'Inter, sans-serif',
    fontSize: `${typography?.baseFontSize || 18}px`,
    ...(typography?.headingFont && { '--heading-font': typography.headingFont } as React.CSSProperties),
    ...(typography?.headingFontFamily && { '--heading-font-family': typography.headingFontFamily } as React.CSSProperties),
    ...(typography?.headingFontWeight && { '--heading-font-weight': typography.headingFontWeight } as React.CSSProperties),
    ...(typography?.headingFontSize && { '--heading-font-size': typography.headingFontSize } as React.CSSProperties),
    ...(typography?.headingLineHeight && { '--heading-line-height': typography.headingLineHeight } as React.CSSProperties),
    ...(typography?.paragraphFontFamily && { '--paragraph-font-family': typography.paragraphFontFamily } as React.CSSProperties),
    ...(typography?.paragraphFontWeight && { '--paragraph-font-weight': typography.paragraphFontWeight } as React.CSSProperties),
    ...(typography?.paragraphFontSize && { '--paragraph-font-size': typography.paragraphFontSize } as React.CSSProperties),
    ...(typography?.paragraphLineHeight && { '--paragraph-line-height': typography.paragraphLineHeight } as React.CSSProperties),
  };
}

export async function generateMetadata() {
  const settings = await getSiteSettings();
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL;

  return {
    title: `${settings.brandName || "LuxeAudio"} | Experience Sound Like Never Before`,
    description: settings.siteDescription || "Premium audio equipment for the discerning listener.",
    openGraph: {
      title: `${settings.brandName || "LuxeAudio"} | Experience Sound Like Never Before`,
      description: settings.siteDescription || "Premium audio equipment for the discerning listener.",
      type: "website",
      url: baseUrl,
    },
    twitter: {
      card: "summary_large_image",
      title: `${settings.brandName || "LuxeAudio"} | Experience Sound Like Never Before`,
      description: settings.siteDescription || "Premium audio equipment for the discerning listener.",
    },
  };
}

export default async function Home() {
  const tenantId = await getTenantId(null, false);

  // If no tenant is resolved, show the SaaS landing page
  if (!tenantId) {
    return <SaaSLanding />;
  }

  // Fetch settings and page data in PARALLEL to halve server-side waterfall latency
  let dynamicPage: any = null;
  try {
    const [pageData] = await Promise.all([
      fetchAPI('/pages/home'),
      // getSiteSettings is already resolved via generateMetadata cache in the same render pass,
      // but we keep the pattern here for any future per-request settings usage.
    ]);

    if (!pageData || !pageData.success || pageData.isSaaS) {
      return <SaaSLanding />;
    }

    dynamicPage = pageData?.data;
  } catch (error) {
    console.error("Home page error:", error);
    return <SaaSLanding />;
  }

  const sections = dynamicPage?.sections || [];
  const typographyStyle = buildTypographyStyle(dynamicPage?.typography || {});

  return (
    <main className="min-h-screen">
      <Suspense fallback={null}>
        <PaymentStatus />
      </Suspense>
      <Navbar />
      <div className="flex flex-col mt-10" style={typographyStyle}>
        {sections.length > 0 ? (
          sections.map((section: any) => (
            <SectionRenderer key={section.id} section={section} />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 text-center">
            <h1 className="text-4xl font-bold mb-4">Welcome to our store</h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">We are currently setting things up. Please check back soon!</p>
          </div>
        )}
        <RecentlyViewedProducts />
      </div>
      <Footer />
    </main>
  );
}
