import FAQ from "@/components/core/FAQ";
import SectionRenderer from "@/components/core/SectionRenderer";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import SaaSLanding from "@/components/marketing/SaaSLanding";
import PaymentStatus from "@/components/store/PaymentStatus";
import ProductDetails from "@/components/store/ProductDetails";
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
  const settings = await getSiteSettings();

  // If no tenant is resolved, show the SaaS landing page
  if (!tenantId) {
    return <SaaSLanding />;
  }

  let homeData: any = null;
  let products: any[] = [];
  let product: any = null;
  let dynamicPage: any = null;

  // Wrap API calls in try-catch to avoid crashing on tenant mismatch or local dev issues
  try {
    const data = await fetchAPI('/home');

    if (!data || !data.success || data.isSaaS) {
      return <SaaSLanding />;
    }

    homeData = data.data;
    products = homeData?.products || [];
    product = products[0];
    dynamicPage = homeData?.page;
  } catch (error) {
    console.error("Home page error:", error);
    return <SaaSLanding />;
  }

  if (settings.productMode === 'single') {
    return (
      <main className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
        <Suspense fallback={null}>
          <PaymentStatus />
        </Suspense>
        <Navbar />
        <ProductDetails product={product} />
        {/* <Reviews /> */}
        <FAQ />
        <Footer />
        <WhatsAppWidget />
      </main>
    );
  }

  console.log("dfasdf", dynamicPage);



  // If a custom home page is designed, render it
  const sections = dynamicPage?.content?.sections || dynamicPage?.sections;
  if (sections && sections.length > 0 && settings.productMode === 'multiple') {
    return (
      <main className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
        <Suspense fallback={null}>
          <PaymentStatus />
        </Suspense>
        <Navbar />
        <div className="flex flex-col">
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
