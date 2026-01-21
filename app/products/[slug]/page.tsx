import Footer from '@/components/layout/Footer';
import Navbar from '@/components/layout/Navbar';
import PaymentStatus from '@/components/store/PaymentStatus';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';

import FAQ from '@/components/core/FAQ';
import ProductDetails from '@/components/store/ProductDetails';
import RelatedProducts from '@/components/store/RelatedProducts';
import Reviews from '@/components/store/Reviews';
import { fetchAPI } from "@/lib/api";

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

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const product = await getProduct(slug);


    if (!product) {
        notFound();
    }

    // Check if product uses the new builder system

    return (
        <main className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
            <PaymentStatus />
            <Navbar />
            <ProductDetails product={product} />
            <Reviews />
            <RelatedProducts currentProductId={product.id} />
            <FAQ />
            <Footer />
        </main>
    );
}
