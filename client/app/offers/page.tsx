import Footer from '@/components/layout/Footer';
import Navbar from '@/components/layout/Navbar';
import WhatsAppWidget from '@/components/shared/WhatsAppWidget';
import OffersPage from '@/features/promotion/components/OffersPage';
import { fetchAPI } from '@/services/api';
import { getSiteSettings } from '@/services/getSettings';
import { getTenantId } from '@/services/tenant';
import Link from 'next/link';

export async function generateMetadata() {
    const settings = await getSiteSettings();
    return {
        title: `🔥 Special Offers & Deals | ${settings?.brandName || 'Store'}`,
        description: `Grab the best deals and discounts at ${settings?.brandName}. Limited time promotions on top products!`,
    };
}

async function getOffersData() {
    try {
        const res = await fetchAPI('/promotions/offers');
        return {
            offerGroups: res.data.offerGroups || [],
            promotions: res.data.promotions || [],
        };
    } catch (error) {
        console.error('Error fetching offers:', error);
        return { offerGroups: [], promotions: [] };
    }
}

export default async function OffersRoutePage() {
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

    const { offerGroups, promotions } = await getOffersData();

    return (
        <main className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
            <Navbar />
            <OffersPage offerGroups={offerGroups} promotions={promotions} />
            <Footer />
            <WhatsAppWidget />
        </main>
    );
}
