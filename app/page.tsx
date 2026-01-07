import FAQ from "@/components/FAQ";
import Features from "@/components/Features";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import Navbar from "@/components/Navbar";
import PaymentStatus from "@/components/PaymentStatus";
import ProductDetails from "@/components/ProductDetails";
import Reviews from "@/components/Reviews";
import WhatsAppWidget from "@/components/WhatsAppWidget";
import { getSiteSettings } from "@/lib/getSettings";

import { Suspense } from "react";


async function getProduct() {
  try {
    const dbConnect = (await import('@/lib/mongodb')).default;
    const { getTenantId } = await import('@/lib/tenant');
    const Product = (await import('@/models/Product')).default;

    await dbConnect();
    const tenantId = await getTenantId();

    if (!tenantId) {
      console.error("No tenant context for home page");
      return null;
    }

    // Fetch the most recently created product that is active and belongs to tenant
    const product = await Product.findOne({ status: "active", tenantId } as any)
      .sort({ createdAt: -1 })
      .lean();

    if (!product) {
      console.log("No active product found for tenant:", tenantId);
      return null;
    }

    return JSON.parse(JSON.stringify(product));
  } catch (error) {
    console.error("Failed to fetch product:", error);
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

import SaaSLanding from "@/components/marketing/SaaSLanding";

export default async function Home() {
  const { getTenantId } = await import('@/lib/tenant');
  const tenantId = await getTenantId();

  // If no tenant is identified, we are on the root SaaS marketing domain
  if (!tenantId) {
    return <SaaSLanding />;
  }

  const [product, settings] = await Promise.all([
    getProduct(),
    getSiteSettings()
  ]);

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
