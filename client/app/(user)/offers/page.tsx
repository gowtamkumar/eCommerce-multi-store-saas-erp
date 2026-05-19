import Footer from '@/components/layout/Footer';
import Navbar from '@/components/layout/Navbar';
import OffersPage from '@/features/promotion/shop/OffersPage';
import { fetchAPI } from '@/services/api';
import { getSiteSettings } from '@/services/getSettings';
import { getTenantId } from '@/services/tenant';
import Link from 'next/link';

// ISR: Regenerate every 60 seconds. Offers change infrequently;
// cache serves most visits instantly while staying reasonably fresh.
export const revalidate = 60;

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

    // Fetch offers data and site settings in PARALLEL to save waterfall latency
    const [{ offerGroups, promotions }, settings] = await Promise.all([
        getOffersData(),
        getSiteSettings(),
    ]);

    // Pass offersSettings as a prop so OffersPage never needs a client-side
    // useSettings() fetch — eliminating a redundant network round-trip.
    const offersSettings = settings?.offersPage;

    return (
        <main className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
            <Navbar />
            <OffersPage
                offerGroups={offerGroups}
                promotions={promotions}
                offersSettings={offersSettings}
            />
            <Footer />
        </main>
    );
}
