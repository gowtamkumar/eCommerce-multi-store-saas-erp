import Footer from '@/components/layout/Footer';
import Navbar from '@/components/layout/Navbar';
import PaymentStatus from '@/components/shared/PaymentStatus';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';

import FAQ from '@/features/admin/faq/components/FAQ';
import ProductDetails from '@/features/product/admin/ProductDetails';
import RelatedProducts from '@/features/product/admin/RelatedProducts';
import Reviews from '@/features/storefront/profile/components/Reviews';
import { fetchAPI } from "@/services/api";
import { getSiteSettings } from '@/services/getSettings';
import TrackRecentlyViewed from '@/components/shared/TrackRecentlyViewed';
import RecentlyViewedProducts from '@/components/shared/RecentlyViewedProducts';

async function getProduct(slug: string) {
    try {
        const res = await fetchAPI(`/products/slug/${slug}`, {
            cache: 'no-store' // Ensure fresh data for builder updates
        });
        return res.success ? res.data : null;
    } catch (error) {
        console.error("Error fetching product:", error);
        return null;
    }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const product = await getProduct(slug);

    if (!product) {
        return {
            title: 'Product Not Found',
            description: 'The requested product could not be found.',
        };
    }

    const headersList = await headers();
    const host = headersList.get('host') || 'localhost:3000';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const baseUrl = `${protocol}://${host}`;
    const productImage = product.images?.[0] || '';
    const description = product.description?.substring(0, 160) || product.tagline || 'Premium product';

    return {
        metadataBase: new URL(baseUrl),
        title: `${product.name}`,
        description,
        openGraph: {
            title: product.name,
            description,
            type: 'website',
            url: `${baseUrl}/products/${slug}`,
            images: productImage ? [
                {
                    url: productImage,
                    width: 1200,
                    height: 630,
                    alt: product.name,
                }
            ] : [],
        },
        twitter: {
            card: 'summary_large_image',
            title: product.name,
            description,
            images: productImage ? [productImage] : [],
        },
    };
}

export default async function Product({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const [product, settings] = await Promise.all([
        getProduct(slug),
        getSiteSettings()
    ]);

    if (!product) {
        notFound();
    }

    const showReviews = settings?.singleProductPage?.showProductReviews !== false;
    const showRelated = settings?.singleProductPage?.showRelatedProducts !== false;
    const showFAQ = settings?.singleProductPage?.showProductFAQs !== false;

    return (
        <main className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
            <PaymentStatus />
            <Navbar />
            <TrackRecentlyViewed product={product} />
            <ProductDetails product={product} />
            {
                showReviews && product.reviews && product.reviews.length > 0 && product.isReview && (
                    <Reviews reviews={product.reviews} />
                )
            }
            {showRelated && <RelatedProducts currentProductId={product.id} />}
            {showFAQ && <FAQ faqs={product.faqs} />}
            <RecentlyViewedProducts />
            <Footer />
        </main>
    );
}
