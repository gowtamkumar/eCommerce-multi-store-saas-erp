import FAQ from '@/components/FAQ';
import Features from '@/components/Features';
import Footer from '@/components/Footer';
import Hero from '@/components/Hero';
import Navbar from '@/components/Navbar';
import PaymentStatus from '@/components/PaymentStatus';
import ProductDetails from '@/components/ProductDetails';
import RelatedProducts from '@/components/RelatedProducts';
import Reviews from '@/components/Reviews';
import dbConnect from '@/lib/mongodb';
import { getTenantId } from '@/lib/tenant';
import Product from '@/models/Product';
import { notFound } from 'next/navigation';

async function getProduct(slug: string) {
    try {
        await dbConnect();
        const tenantId = await getTenantId();
        if (!tenantId) return null;

        const product = await Product.findOne({ slug, tenantId }).lean();
        return product ? JSON.parse(JSON.stringify(product)) : null;
    } catch (error) {
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

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const productImage = product.images?.[0] || '';
    const description = product.description?.substring(0, 160) || product.tagline || 'Premium product';

    return {
        metadataBase: new URL(baseUrl),
        title: `${product.name} | LuxeAudio`,
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
            <RelatedProducts currentProductId={product._id} />
            <FAQ />
            <Footer />
        </main>
    );
}
