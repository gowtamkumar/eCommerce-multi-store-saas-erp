import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import PaymentStatus from "@/components/shared/PaymentStatus";
import WhatsAppWidget from "@/components/shared/WhatsAppWidget";
import { fetchAPI } from "@/services/api";
import { getSiteSettings } from "@/services/getSettings";
import { getTenantId } from "@/services/tenant";
import Link from "next/link";
import { Suspense } from "react";
import ProductsClientWrapper from "@/features/admin/product/components/ProductsClientWrapper"; // New client wrapper for layout state

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
            products: res.data || [],
            total: res.pagination?.total || 0
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

    const [productsData, categories, brands, filterOptions, settings] = await Promise.all([
        getProductsData(params),
        getCategoriesData(),
        getBrandsData(),
        getFilterMetadata(categoryId),
        getSiteSettings()
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
                <div className={`${productsPageSettings.bannerFullWidth ? 'max-w-full px-0' : 'container mx-auto px-4'}`}>
                    {productsPageSettings.bannerShow !== false && (
                        <div
                            className={`relative mb-16 overflow-hidden transition-all duration-500 ${productsPageSettings.bannerFullWidth
                                ? 'py-24 px-8 md:py-32'
                                : 'py-16 px-8 rounded-[3rem]'
                                } ${productsPageSettings.bannerStyle === 'minimal'
                                    ? 'border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm'
                                    : productsPageSettings.bannerStyle === 'modern'
                                        ? 'bg-slate-50 dark:bg-slate-800/20'
                                        : ''
                                }`}
                            style={{
                                backgroundColor: productsPageSettings.bannerBackgroundColor || undefined,
                                backgroundImage: productsPageSettings.bannerImage ? `url(${productsPageSettings.bannerImage})` : undefined,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                color: productsPageSettings.bannerTextColor || undefined
                            }}
                        >
                            {/* Abstract Background Decoration for Modern Style */}
                            {productsPageSettings.bannerStyle === 'modern' && !productsPageSettings.bannerImage && (
                                <>
                                    <div className="absolute inset-0 bg-slate-50 dark:bg-slate-800/50 z-0" />
                                    <div className="absolute -top-24 -right-24 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl z-0" />
                                    <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-brand-600/5 rounded-full blur-3xl z-0" />
                                </>
                            )}

                            {/* Overlay for Image Style */}
                            {productsPageSettings.bannerImage && (
                                <div
                                    className="absolute inset-0 bg-black/40 z-0"
                                    style={{ opacity: (productsPageSettings.bannerOverlayOpacity || 40) / 100 }}
                                />
                            )}

                            <div className="relative z-10 text-center max-w-4xl mx-auto">
                                <div
                                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-6 ${productsPageSettings.bannerImage || (productsPageSettings.bannerTextColor && productsPageSettings.bannerTextColor !== '#000000')
                                        ? 'bg-white/10 backdrop-blur-md text-white border border-white/20'
                                        : 'bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400'
                                        }`}
                                >
                                    <span className={`w-2 h-2 rounded-full animate-pulse ${productsPageSettings.bannerImage || (productsPageSettings.bannerTextColor && productsPageSettings.bannerTextColor !== '#000000')
                                        ? 'bg-white'
                                        : 'bg-brand-500'
                                        }`} />
                                    {productsPageSettings.bannerTagline || "Exclusive Collection"}
                                </div>

                                <h1
                                    className={`text-5xl md:text-7xl lg:text-8xl font-black mb-6 leading-tight tracking-tight ${!productsPageSettings.bannerTextColor && (!productsPageSettings.bannerImage)
                                        ? 'text-slate-900 dark:text-white'
                                        : ''
                                        }`}
                                    style={{ color: productsPageSettings.bannerTextColor || (productsPageSettings.bannerImage ? '#ffffff' : undefined) }}
                                >
                                    {productsPageSettings.bannerHeadline || "Our Collection"}
                                </h1>

                                <p
                                    className={`text-xl md:text-2xl font-medium leading-relaxed max-w-2xl mx-auto ${!productsPageSettings.bannerTextColor && (!productsPageSettings.bannerImage)
                                        ? 'text-slate-500 dark:text-slate-400'
                                        : ''
                                        }`}
                                    style={{ color: productsPageSettings.bannerTextColor ? `${productsPageSettings.bannerTextColor}cc` : (productsPageSettings.bannerImage ? 'rgba(255,255,255,0.9)' : undefined) }}
                                >
                                    {productsPageSettings.bannerSubheadline || "Premium products curated for you."}
                                </p>
                            </div>
                        </div>
                    )}

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
            <WhatsAppWidget />
        </main>
    );
}
