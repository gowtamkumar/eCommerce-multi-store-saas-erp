import FAQ from "@/components/FAQ";
import Features from "@/components/Features";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import SaaSLanding from "@/components/marketing/SaaSLanding";
import Navbar from "@/components/Navbar";
import PaymentStatus from "@/components/PaymentStatus";
import ProductDetails from "@/components/ProductDetails";
import Reviews from "@/components/Reviews";
import SectionRenderer from "@/components/SectionRenderer";
import WhatsAppWidget from "@/components/WhatsAppWidget";
import { getSiteSettings } from "@/lib/getSettings";
import { headers } from "next/headers";
import { Suspense } from "react";

async function getHomeData() {
  try {
    const headersList = await headers();
    const host = headersList.get("host");
    const protocol = host?.includes("localhost") ? "http" : "https";

    if (!host) return null;

    const res = await fetch(`${protocol}://${host}/api/home`, {
      headers: {
        host: host,
        "x-tenant-id": headersList.get("x-tenant-id") || "",
        cookie: headersList.get("cookie") || ""
      },
      cache: 'no-store'
    });

    if (!res.ok) return null;

    return await res.json();
  } catch (error) {
    console.error("Error fetching home data:", error);
    return null;
  }
}

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
  const data = await getHomeData();

  if (!data || !data.success) {
    // Fallback if API fails? Or show error? 
    // For now, if no data, maybe just return SaaS landing since maybe tenant check failed
    return <SaaSLanding />;
  }

  if (data.isSaaS) {
    return <SaaSLanding />;
  }

  const { product, settings, dynamicPage } = data;

  // If a custom home page is designed, render it
  if (dynamicPage && dynamicPage.sections && dynamicPage.sections.length > 0) {
    return (
      <main className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
        <Suspense fallback={null}>
          <PaymentStatus />
        </Suspense>
        <Navbar />
        <SectionRenderer sections={dynamicPage.sections} />
        <WhatsAppWidget />
        <Footer />
      </main>
    );
  }

  // Multiple Product Mode: Show Grid
  if (settings.productMode === 'multiple') {
    const ProductGrid = (await import('@/components/ProductGrid')).default;
    return (
      <main className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
        <Suspense fallback={null}>
          <PaymentStatus />
        </Suspense>
        <Navbar />
        <div className="container mx-auto px-4 pt-24 pb-12">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h1 className="text-4xl md:text-6xl font-bold font-display text-slate-900 dark:text-white mb-6">
              {settings.brandName} Collection
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-400">
              {settings.siteDescription}
            </p>
          </div>
          <ProductGrid />
        </div>
        <Reviews />
        <FAQ />
        <Footer />
        <WhatsAppWidget />
      </main>
    );
  }

  // Single Product Mode (Default)
  return (
    <main className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
      <Suspense fallback={null}>
        <PaymentStatus />
      </Suspense>
      <Navbar />
      <Hero product={product} />
      <Features product={product} />
      <ProductDetails product={product} />
      <Reviews />
      <FAQ />
      <Footer />
      <WhatsAppWidget />
    </main>
  );
}
