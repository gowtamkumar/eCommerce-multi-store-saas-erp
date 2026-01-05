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

import { headers } from "next/headers";

async function getProduct() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
    const headerList = await headers();
    const host = headerList.get("host");

    const res = await fetch(`${baseUrl}/api/products/latest`, {
      cache: "no-store",
      headers: {
        Host: host || "localhost:3000",
      },
    });

    if (!res.ok) {
      // console.error("Failed to fetch product:", res.statusText);
      return null;
    }

    const product = await res.json();
    return product;
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

export default async function Home() {
  const product = await getProduct();

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
