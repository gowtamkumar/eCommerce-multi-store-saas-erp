"use client";

import Footer from '@/components/layout/Footer';
import Navbar from '@/components/layout/Navbar';
import { fetchAPI } from '@/services/api';
import { AnimatePresence, motion } from 'framer-motion';
import { Calendar, Loader2, LogOut, MapPin, Package, ShieldCheck, User, Heart, ChevronRight } from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import ProfileForm from './ProfileForm';

const CustomerOrders = dynamic(() => import('./CustomerOrders'), {
    loading: () => <div className="p-12 text-center text-slate-500 font-bold animate-pulse">Loading your orders...</div>
});

const ShippingAddresses = dynamic(() => import('./ShippingAddresses'), {
    loading: () => <div className="p-12 text-center text-slate-500 font-bold animate-pulse">Loading addresses...</div>
});

const WishlistComponent = dynamic(() => import('./WishlistComponent'), {
    loading: () => <div className="p-12 text-center text-slate-500 font-bold animate-pulse">Loading wishlist...</div>
});

export default function Profile() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'personal' | 'orders' | 'addresses' | 'wishlist' | 'security'>('personal');

    const [stats, setStats] = useState({
        totalOrders: 0,
        memberSince: 'Loading...'
    });

    const [formData, setFormData] = useState<any>({});

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/login');
        }
    }, [status, router]);

    useEffect(() => {
        if (session?.user) {
            setFormData(session.user);
        }
    }, [session]);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                if (session?.user?.id) {
                    const countData = await fetchAPI(`/orders/user/${session.user.id}/count`);
                    const user = session.user as any;
                    setStats({
                        totalOrders: countData.data || 0,
                        memberSince: user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Member'
                    });
                }
            } catch (error) {
                console.error('Failed to fetch stats', error);
            }
        };

        fetchStats();
    }, [session?.user?.id]);

    if (status === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
                <div className="flex flex-col items-center gap-6">
                    <div className="relative">
                        <Loader2 className="w-12 h-12 text-brand-600 animate-spin" />
                        <div className="absolute inset-0 bg-brand-500/20 blur-xl animate-pulse rounded-full" />
                    </div>
                    <p className="text-slate-500 text-sm font-black uppercase tracking-widest animate-pulse">Initializing Dashboard</p>
                </div>
            </div>
        );
    }

    const tabs = [
        { id: 'personal', label: 'Personal Info', icon: User },
        { id: 'orders', label: 'Order History', icon: Package },
        { id: 'wishlist', label: 'Wishlist Items', icon: Heart },
        { id: 'addresses', label: 'Manage Addresses', icon: MapPin },
        { id: 'security', label: 'Account Security', icon: ShieldCheck },
    ] as const;

    return (
        <main className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
            <Navbar />

            <div className="flex-1 pt-24 pb-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Professional Breadcrumb/Meta */}
                    <div className="flex items-center gap-2 mb-8 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                        <span>Profile</span>
                        <ChevronRight className="w-3 h-3" />
                        <span className="text-brand-600">{tabs.find(t => t.id === activeTab)?.label}</span>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-8 items-start">
                        {/* Sidebar Navigation */}
                        <aside className="w-full lg:w-80 space-y-4 lg:sticky lg:top-28">
                            {/* User Identity Card */}
                            <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 border border-slate-200/50 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none overflow-hidden relative group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/5 blur-[50px] -mr-16 -mt-16 group-hover:bg-brand-500/10 transition-colors" />
                                
                                <div className="relative flex items-center gap-4 mb-6">
                                    <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-white dark:border-slate-800 shadow-lg relative bg-slate-100 dark:bg-slate-800">
                                        <img
                                            src={session?.user?.image || "/images/placeholder-avatar.jpg"}
                                            alt={session?.user?.name || "User"}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="flex-1 overflow-hidden">
                                        <h2 className="text-xl font-black text-slate-900 dark:text-white truncate">
                                            {session?.user?.name}
                                        </h2>
                                        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 truncate">
                                            {session?.user?.email}
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3 pt-6 border-t border-slate-100 dark:border-slate-800">
                                    <div className="p-3 bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-slate-100 dark:border-slate-800/50">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Orders</p>
                                        <p className="text-lg font-black text-slate-900 dark:text-white font-mono">{stats.totalOrders}</p>
                                    </div>
                                    <div className="p-3 bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-slate-100 dark:border-slate-800/50">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Since</p>
                                        <p className="text-xs font-black text-slate-900 dark:text-white">{stats.memberSince.split(' ')[0]} '{stats.memberSince.split(' ')[1]?.slice(-2)}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Nav Menu */}
                            <nav className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-[2rem] p-3 border border-slate-200/50 dark:border-slate-800 shadow-xl shadow-slate-200/30 dark:shadow-none">
                                <div className="space-y-1">
                                    {tabs.map((tab) => {
                                        const Icon = tab.icon;
                                        const isActive = activeTab === tab.id;
                                        return (
                                            <button
                                                key={tab.id}
                                                onClick={() => setActiveTab(tab.id as any)}
                                                className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl text-[13px] font-black transition-all relative group ${isActive
                                                    ? 'text-brand-600 dark:text-brand-400 bg-brand-50/50 dark:bg-brand-900/20 shadow-sm'
                                                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50/80 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'
                                                    }`}
                                            >
                                                <Icon className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110 ${isActive ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400 dark:text-slate-500'}`} />
                                                <span className="tracking-tight uppercase tracking-widest text-[11px]">{tab.label}</span>
                                                {isActive && (
                                                    <motion.div
                                                        layoutId="activeTabDot"
                                                        className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-600 dark:bg-brand-400 shadow-[0_0_10px_rgba(79,70,229,0.5)]"
                                                    />
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>

                                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/50 px-2">
                                    <button
                                        onClick={() => signOut()}
                                        className="w-full flex items-center gap-3 px-5 py-3 rounded-2xl text-[11px] font-black text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/10 transition-all uppercase tracking-widest"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        Sign Out Account
                                    </button>
                                </div>
                            </nav>
                        </aside>

                        {/* Content Area */}
                        <div className="flex-1 w-full">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeTab}
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -15 }}
                                    transition={{ duration: 0.25, ease: "easeOut" }}
                                    className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200/50 dark:border-slate-800 shadow-2xl shadow-slate-200/50 dark:shadow-none overflow-hidden"
                                >
                                    <div className="p-8 border-b border-slate-50 dark:border-slate-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div>
                                            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                                                {tabs.find(t => t.id === activeTab)?.label}
                                            </h3>
                                            <p className="text-slate-500 dark:text-slate-400 text-xs font-bold mt-1">
                                                {activeTab === 'personal' && 'Manage your account details and profile information'}
                                                {activeTab === 'orders' && 'Track and manage your recent purchase history'}
                                                {activeTab === 'wishlist' && 'Products you have saved to buy later'}
                                                {activeTab === 'addresses' && 'Manage your primary and secondary shipping locations'}
                                                {activeTab === 'security' && 'Manage your account password and security preferences'}
                                            </p>
                                        </div>
                                        <div className="flex -space-x-2">
                                            <div className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-900 bg-brand-500 flex items-center justify-center text-white text-[10px] font-black">P</div>
                                            <div className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-900 bg-indigo-500 flex items-center justify-center text-white text-[10px] font-black">R</div>
                                            <div className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-900 bg-slate-900 dark:bg-slate-700 flex items-center justify-center text-white text-[10px] font-black">O</div>
                                        </div>
                                    </div>

                                    <div className="min-h-[600px]">
                                        {activeTab === 'personal' && (
                                            <ProfileForm variant="personal" formData={formData} setFormData={setFormData} />
                                        )}

                                        {activeTab === 'orders' && (
                                            <div className="p-2">
                                                <CustomerOrders />
                                            </div>
                                        )}

                                        {activeTab === 'addresses' && (
                                            <ShippingAddresses />
                                        )}

                                        {activeTab === 'wishlist' && (
                                            <WishlistComponent />
                                        )}

                                        {activeTab === 'security' && (
                                            <ProfileForm variant="security" formData={formData} setFormData={setFormData} />
                                        )}
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </main>
    );
}
