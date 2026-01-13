import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import PaymentStatus from "@/components/PaymentStatus";
import ProductList from "@/components/ProductList";
import WhatsAppWidget from "@/components/WhatsAppWidget";
import { fetchAPI } from "@/lib/api";
import { getSiteSettings } from "@/lib/getSettings";
import { Suspense } from "react";

export async function generateMetadata() {
  const settings = await getSiteSettings();

  return {
    title: `Our Products | ${settings.brandName || "Store"}`,
    description: `Browse our full collection of premium products at ${settings.brandName}.`,
  };
}

async function getProductsData() {
  try {
    const res = await fetchAPI('/products?limit=50&status=active');
    return {
      products: res.data?.products || [],
      total: res.data?.pagination?.total || 0
    };
  } catch (error) {
    console.error("Error fetching product list:", error);
    return { products: [], total: 0 };
  }
}

export default async function ProductsPage() {
  const { products, total } = await getProductsData();
  const settings = await getSiteSettings();

  return (
    <main className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
      <Suspense fallback={null}>
        <PaymentStatus />
      </Suspense>

      <Navbar />

      <div className="pt-32 pb-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mb-12">
            <h1 className="text-4xl md:text-6xl font-bold font-display text-slate-900 dark:text-white mb-6">
              Our <span className="text-gradient">Collection</span>
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-400">
              Discover {total} premium products designed to elevate your experience.
            </p>
          </div>

          <ProductList initialProducts={products} total={total} />
        </div>
      </div>

      <Footer />
      <WhatsAppWidget />
    </main>
  );
}
