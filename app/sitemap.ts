import { MetadataRoute } from 'next';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';
import Page from '@/models/Page';
import { getTenantId } from '@/lib/tenant';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL

    // Static routes
    const routes = [
        '',
        '/contact',
        '/login',
        '/register',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 1,
    }));

    // Fetch dynamic data
    await dbConnect();
    const tenantId = await getTenantId();

    if (!tenantId) {
        return routes;
    }

    // Products
    const products = await Product.find({ status: 'active', tenantId }).select('_id updatedAt').lean();
    const productRoutes = products.map((product: any) => ({
        url: `${baseUrl}/products/${product.id}`,
        lastModified: new Date(product.updatedAt),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
    }));

    // Pages
    const pages = await Page.find({ status: 'published', tenantId }).select('slug updatedAt').lean();
    const pageRoutes = pages.map((page: any) => ({
        url: `${baseUrl}/page/${page.slug}`,
        lastModified: new Date(page.updatedAt),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
    }));

    return [...routes, ...productRoutes, ...pageRoutes];
}
