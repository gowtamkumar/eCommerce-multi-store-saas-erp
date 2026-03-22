import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import PaymentStatus from "@/components/shared/PaymentStatus";
import WhatsAppWidget from "@/components/shared/WhatsAppWidget";
import { fetchAPI } from "@/services/api";
import { getSiteSettings } from "@/services/getSettings";
import { getTenantId } from "@/services/tenant";
import { Suspense } from "react";
import SaaSLanding from "@/features/system/components/SaaSLanding";
import SectionRenderer from "@/features/admin/pages/components/customizer/SectionRenderer";
import RecentlyViewedProducts from "@/components/shared/RecentlyViewedProducts";


export async function generateMetadata() {
  const settings = await getSiteSettings();
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL;

  return {
    title: `${settings.brandName || "LuxeAudio"
      } | Experience Sound Like Never Before`,
    description:
      settings.siteDescription ||
      "Premium audio equipment for the discerning listener.",
    openGraph: {
      title: `${settings.brandName || "LuxeAudio"
        } | Experience Sound Like Never Before`,
      description:
        settings.siteDescription ||
        "Premium audio equipment for the discerning listener.",
      type: "website",
      url: baseUrl,
    },
    twitter: {
      card: "summary_large_image",
      title: `${settings.brandName || "LuxeAudio"
        } | Experience Sound Like Never Before`,
      description:
        settings.siteDescription ||
        "Premium audio equipment for the discerning listener.",
    },
  };
}


export default async function Home() {
  const tenantId = await getTenantId(null, false);

  // If no tenant is resolved, show the SaaS landing page
  if (!tenantId) {
    return <SaaSLanding />;
  }

  let dynamicPage: any = null;

  // Wrap API calls in try-catch to avoid crashing on tenant mismatch or local dev issues
  try {
    const data = await fetchAPI('/pages/home');

    if (!data || !data.success || data.isSaaS) {
      return <SaaSLanding />;
    }
    dynamicPage = data?.data;
  } catch (error) {
    console.error("Home page error:", error);
    return <SaaSLanding />;
  }


  // If a custom home page is designed, render it
  const sections = dynamicPage?.sections || [];
  const typography = dynamicPage?.typography || {};

  return (
    <main className="min-h-screen">
      <Suspense fallback={null}>
        <PaymentStatus />
      </Suspense>
      <Navbar />
      <div className="flex flex-col mt-10"
        style={{
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
        }}
      >
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
      <WhatsAppWidget />
      <Footer />
    </main>
  );


}
