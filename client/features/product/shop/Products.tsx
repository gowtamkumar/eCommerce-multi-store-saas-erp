import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import PaymentStatus from "@/components/shared/PaymentStatus";
import ProductPageBanner from "@/features/product/shop/ProductPageBanner";
import ProductsClientWrapper from "@/features/product/shop/ProductsClientWrapper";
import { fetchAPI } from "@/services/api";
import { getSiteSettings } from "@/services/getSettings";
import { getStoreId } from "@/services/store";
import Link from "next/link";
import { Suspense } from "react";

// ISR: Regenerate every 30 seconds. Short enough to reflect price/stock changes,
// fast enough to serve cached HTML on high-traffic filter combinations.
export const revalidate = 30;

export async function generateMetadata() {
    const settings = await getSiteSettings();

    return {
        title: `Our Products | ${settings.brandName || "Store"}`,
        description: `Browse our full collection of premium products at ${settings.brandName}.`,
    };
}

// --- Typed data-fetching helpers ---

async function getProductsData(searchParams: { [key: string]: string | string[] | undefined }) {
    try {
        const params = new URLSearchParams();
        params.set('limit', '20');
        params.set('status', 'active');

        if (searchParams.search) params.set('q', searchParams.search as string);
        if (searchParams.categoryId) params.set('categoryId', searchParams.categoryId as string);
        if (searchParams.brandId) params.set('brandId', searchParams.brandId as string);
        if (searchParams.minPrice) params.set('minPrice', searchParams.minPrice as string);
        if (searchParams.maxPrice) params.set('maxPrice', searchParams.maxPrice as string);
        if (searchParams.page) params.set('page', searchParams.page as string);

        const res = await fetchAPI(`/products?${params.toString()}`);
        return {
            products: res.data || [],
            total: res.pagination?.total || 0,
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

async function getFilterMetadata(categoryId?: string) {
    try {
        const params = new URLSearchParams();
        if (categoryId) params.set('categoryId', categoryId);
        const res = await fetchAPI(`/products/filters?${params.toString()}`);
        return res.success ? res.data : null;
    } catch (error) {
        console.error("Error fetching filter metadata:", error);
        return null;
    }
}

export default async function Products({
    searchParams,
}: {
    searchParams: { [key: string]: string | string[] | undefined };
}) {
    const params = await searchParams;
    const categoryId = params.categoryId as string | undefined;
    const storeId = await getStoreId();

    if (!storeId) {
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

    // Fetch all page data in parallel — each independent data source runs concurrently
    const [productsData, categories, brands, filterOptions, settings] = await Promise.all([
        getProductsData(params),
        getCategoriesData(),
        getBrandsData(),
        getFilterMetadata(categoryId),
        getSiteSettings(),
    ]);

    const { products, total } = productsData;
    const productsPageSettings = settings?.productsPage || {};

    return (
        <main className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
            <Suspense fallback={null}>
                <PaymentStatus />
            </Suspense>

            <Navbar />

            <div className={`pb-20 ${productsPageSettings.bannerFullWidth ? 'pt-0' : 'pt-24'}`}>
                <div className={productsPageSettings.bannerFullWidth ? 'max-w-full px-0' : 'container mx-auto px-4'}>

                    {/* Banner: extracted to a dedicated component for cleaner JSX */}
                    <ProductPageBanner settings={productsPageSettings} />

                    <div className={productsPageSettings.bannerFullWidth ? 'container mx-auto px-4' : ''}>
                        <ProductsClientWrapper
                            categories={categories}
                            brands={brands}
                            products={products}
                            total={total}
                            filterOptions={filterOptions}
                            settings={productsPageSettings}
                        />
                    </div>
                </div>
            </div>

            <Footer />
        </main>
    );
}
