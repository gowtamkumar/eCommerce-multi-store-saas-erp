import SectionRenderer from "@/components/core/SectionRenderer";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import SaaSLanding from "@/components/marketing/SaaSLanding";
import PaymentStatus from "@/components/store/PaymentStatus";
import WhatsAppWidget from "@/components/ui/WhatsAppWidget";
import { fetchAPI } from "@/lib/api";
import { getSiteSettings } from "@/lib/getSettings";
import { getTenantId } from "@/lib/tenant";
import { Suspense } from "react";


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
  const sections = dynamicPage?.sections;
  if (sections && sections.length > 0) {
    return (
      <main className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
        <Suspense fallback={null}>
          <PaymentStatus />
        </Suspense>
        <Navbar />
        <div className="flex flex-col"
          style={{
            fontFamily: dynamicPage?.typography?.fontFamily || 'Inter, sans-serif',
            fontSize: `${dynamicPage?.typography?.baseFontSize || 18}px`,
            ...(dynamicPage?.typography?.headingFont && { '--heading-font': dynamicPage?.typography.headingFont } as React.CSSProperties),
            ...(dynamicPage?.typography?.headingFontFamily && { '--heading-font-family': dynamicPage?.typography.headingFontFamily } as React.CSSProperties),
            ...(dynamicPage?.typography?.headingFontWeight && { '--heading-font-weight': dynamicPage?.typography.headingFontWeight } as React.CSSProperties),
            ...(dynamicPage?.typography?.headingFontSize && { '--heading-font-size': dynamicPage?.typography.headingFontSize } as React.CSSProperties),
            ...(dynamicPage?.typography?.headingLineHeight && { '--heading-line-height': dynamicPage?.typography.headingLineHeight } as React.CSSProperties),
            ...(dynamicPage?.typography?.paragraphFontFamily && { '--paragraph-font-family': dynamicPage?.typography.paragraphFontFamily } as React.CSSProperties),
            ...(dynamicPage?.typography?.paragraphFontWeight && { '--paragraph-font-weight': dynamicPage?.typography.paragraphFontWeight } as React.CSSProperties),
            ...(dynamicPage?.typography?.paragraphFontSize && { '--paragraph-font-size': dynamicPage?.typography.paragraphFontSize } as React.CSSProperties),
            ...(dynamicPage?.typography?.paragraphLineHeight && { '--paragraph-line-height': dynamicPage?.typography.paragraphLineHeight } as React.CSSProperties),
          }}
        >
          {sections.map((section: any) => (
            <SectionRenderer key={section.id} section={section} />
          ))}
        </div>
        <WhatsAppWidget />
        <Footer />
      </main>
    );
  }


}
