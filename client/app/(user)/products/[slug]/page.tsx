import Product from "@/features/admin/product/components/Product";
import { fetchAPI } from "@/services/api";
import { Metadata } from 'next';

async function getProduct(slug: string) {
    try {
        const data = await fetchAPI(`/products/slug/${slug}`);
        return data.success ? data.data : data;
    } catch (error) {
        console.error("Error fetching product:", error);
        return null;
    }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const product = await getProduct(slug);

    if (!product) return { title: 'Product Not Found' };

    const title = product.metaTitle || product.name;
    const description = product.metaDescription || product.shortDescription;
    const image = product.ogImage || (product.images && product.images[0]);

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            images: image ? [image] : [],
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: image ? [image] : [],
        },
    };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
    return (
        <Product params={params} />
    );
}