import FAQ from '@/components/FAQ';
import Features from '@/components/Features';
import Footer from '@/components/Footer';
import Hero from '@/components/Hero';
import Navbar from '@/components/Navbar';
import PaymentStatus from '@/components/PaymentStatus';
import ProductDetails from '@/components/ProductDetails';
import Reviews from '@/components/Reviews';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';

import RelatedProducts from '@/components/RelatedProducts';
import { fetchAPI } from "@/lib/api";

async function getProduct(slug: string) {
    try {
        // const tenantId = await resolveTenantId();
        // if (!tenantId) return null;

        // const res = await fetchAPI(`/products/slug/${slug}`, {
        //     headers: { "x-tenant-id": tenantId },
        //     cache: 'no-store'
        // });


        const res = await fetchAPI(`/products/slug/${slug}`);

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

    return (
        <main className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
            <PaymentStatus />
            <Navbar />
            <Hero product={product} />
            <Features product={product} />
            <ProductDetails product={product} />
            <Reviews />
            <RelatedProducts currentProductId={product.id} />
            <FAQ />
            <Footer />
        </main>
    );
}
