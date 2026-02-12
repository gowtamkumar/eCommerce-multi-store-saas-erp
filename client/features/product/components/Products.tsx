import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import PaymentStatus from "@/components/shared/PaymentStatus";
import WhatsAppWidget from "@/components/shared/WhatsAppWidget";
import { fetchAPI } from "@/services/api";
import { getSiteSettings } from "@/services/getSettings";
import { getTenantId } from "@/services/tenant";
import Link from "next/link";
import { Suspense } from "react";
import ProductsClientWrapper from "@/features/product/components/ProductsClientWrapper"; // New client wrapper for layout state

export async function generateMetadata() {
    const settings = await getSiteSettings();

    return {
        title: `Our Products | ${settings.brandName || "Store"}`,
        description: `Browse our full collection of premium products at ${settings.brandName}.`,
    };
}

async function getProductsData(searchParams: { [key: string]: string | string[] | undefined }) {
    try {
        // Construct query string
        const params = new URLSearchParams();
        params.set('limit', '20'); // Pagination limit
        params.set('status', 'active');

        // Pass through filters
        if (searchParams.search) params.set('q', searchParams.search as string);
        if (searchParams.categoryId) params.set('categoryId', searchParams.categoryId as string);
        if (searchParams.brandId) params.set('brandId', searchParams.brandId as string);
        if (searchParams.minPrice) params.set('minPrice', searchParams.minPrice as string);
        if (searchParams.maxPrice) params.set('maxPrice', searchParams.maxPrice as string);
        if (searchParams.page) params.set('page', searchParams.page as string);

        // Server-side sort isn't fully implemented in Service yet (it defaults to date), 
        // but we can pass it if we add it later. ProductList does some sorting locally too if needed,
        // but ideally the API handles it.

        // For now we rely on the API returning filtered results.

        const res = await fetchAPI(`/products?${params.toString()}`);
        return {
            products: res.data?.products || [],
            total: res.data?.pagination?.total || 0
        };
    } catch (error) {
        console.error("Error fetching product list:", error);
        return { products: [], total: 0 };
    }
}

async function getCategoriesData() {
    try {
        const res = await fetchAPI('/categories');
        return res.success ? res.data : [];
    } catch (error) {
        console.error("Error fetching categories:", error);
        return [];
    }
}

async function getBrandsData() {
    try {
        const res = await fetchAPI('/brands');
        return res.success ? res.data : [];
    } catch (error) {
        console.error("Error fetching brands:", error);
        return [];
    }
}

export default async function Products({
    searchParams,
}: {
    searchParams: { [key: string]: string | string[] | undefined };
}) {
    const tenantId = await getTenantId();

    if (!tenantId) {
        return (
            <main className="min-h-screen flex items-center justify-center p-4">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">Store Not Found</h1>
                    <p className="text-slate-600">Please check the URL or contact support.</p>
                    <Link href="/" className="mt-6 inline-block px-6 py-2 bg-brand-600 text-white rounded-lg">Go Home</Link>
                </div>
            </main>
        );
    }

    const [productsData, categories, brands] = await Promise.all([
        getProductsData(searchParams),
        getCategoriesData(),
        getBrandsData()
    ]);

    const { products, total } = productsData;

    return (
        <main className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
            <Suspense fallback={null}>
                <PaymentStatus />
            </Suspense>

            <Navbar />

            <div className="pt-32 pb-24">
                <div className="container mx-auto px-4">
                    <div className=" mb-12 text-center">
                        <h1 className="text-4xl md:text-5xl font-bold font-display text-slate-900 dark:text-white mb-4">
                            Our <span className="text-gradient">Collection</span>
                        </h1>
                        <p className="text-lg text-slate-600 dark:text-slate-400">
                            Discover premium products designed to elevate your experience.
                        </p>
                    </div>

                    <ProductsClientWrapper
                        categories={categories}
                        brands={brands}
                        products={products}
                        total={total}
                    />
                </div>
            </div>

            <Footer />
            <WhatsAppWidget />
        </main>
    );
}
