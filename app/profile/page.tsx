import Footer from '@/components/layout/Footer';
import Navbar from '@/components/layout/Navbar';
import ProfileForm from '@/components/forms/ProfileForm';
import CustomerOrders from '@/components/store/CustomerOrders';
import { authOptions } from '@/lib/authOptions';
import { getSiteSettings } from '@/lib/getSettings';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

export default async function ProfilePage() {
    // Check authentication on server side
    const session = await getServerSession(authOptions);

    // Redirect if not authenticated (middleware should handle this, but adding as backup)
    if (!session) {
        redirect('/login');
    }

    const settings = await getSiteSettings();

    return (
        <main className="min-h-screen bg-white dark:bg-slate-900 pt-20">
            <Navbar settings={settings} />
            <ProfileForm />
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
                <CustomerOrders />
            </div>
            <Footer settings={settings} />
        </main>
    );
}
