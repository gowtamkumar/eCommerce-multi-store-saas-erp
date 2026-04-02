import Footer from '@/components/layout/Footer';
import Navbar from '@/components/layout/Navbar';
import WhatsAppWidget from '@/components/shared/WhatsAppWidget';
import PromotionDetails from '@/features/promotion/shop/PromotionDetails';
import { getSiteSettings } from '@/services/getSettings';
import { getPromotionBySlug } from '@/services/promotion';
import { getTenantId } from '@/services/tenant';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export async function generateMetadata({ params }: { params: { slug: string } }) {
    const settings = await getSiteSettings();
    try {
        const res = await getPromotionBySlug(params.slug);
        if (!res || !res.data.promotion) return { title: settings?.brandName };

        return {
            title: `${res.data.promotion.name} | Special Offers | ${settings?.brandName || 'Store'}`,
            description: res.data.promotion.description || `Grab the best deals for ${res.data.promotion.name}. Limited time offer!`,
        };
    } catch (e) {
        return { title: `Offer | ${settings?.brandName}` };
    }
}

async function getData(slug: string) {
    console.log("slug", slug);

    try {
        const res = await getPromotionBySlug(slug);
        return res.data;
    } catch (error) {
        console.error('Error fetching promotion:', error);
        return null;
    }
}

export default async function PromotionSlugRoutePage({ params }: { params: { slug: string } }) {
    const { slug } = await params;
    const tenantId = await getTenantId();

    if (!tenantId) {
        return (
            <main className="min-h-screen flex items-center justify-center p-4">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">Store Not Found</h1>
                    <Link href="/" className="px-6 py-2 bg-brand-600 text-white rounded-lg">Go Home</Link>
                </div>
            </main>
        );
    }

    const data = await getData(slug);

    if (!data || !data.promotion) {
        notFound();
    }

    return (
        <main className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
            <Navbar />
            <PromotionDetails promotion={data.promotion} products={data.products || []} />
            <Footer />
            <WhatsAppWidget />
        </main>
    );
}
