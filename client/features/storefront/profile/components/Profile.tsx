"use client";



import Footer from '@/components/layout/Footer';
import Navbar from '@/components/layout/Navbar';
import { fetchAPI } from '@/services/api';
import { AnimatePresence, motion } from 'framer-motion';
import { Calendar, Loader2, LogOut, MapPin, Package, ShieldCheck, User } from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import ProfileForm from './ProfileForm';

const CustomerOrders = dynamic(() => import('./CustomerOrders'), {
    loading: () => <div className="p-8 text-center text-slate-500">Loading Orders...</div>
});

const ShippingAddresses = dynamic(() => import('./ShippingAddresses'), {
    loading: () => <div className="p-8 text-center text-slate-500">Loading Addresses...</div>
});

export default function Profile() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'personal' | 'orders' | 'addresses' | 'security'>('personal');

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
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 text-brand-500 animate-spin" />
                    <p className="text-slate-500 font-bold animate-pulse">Loading secure profile...</p>
                </div>
            </div>
        );
    }


    const tabs = [
        { id: 'profile', label: 'My Profile', icon: User },
        { id: 'orders', label: 'Order History', icon: Package },
        { id: 'addresses', label: 'Shipping Addresses', icon: MapPin },
        { id: 'security', label: 'Security', icon: ShieldCheck },
    ];

    return (
        <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
            <Navbar />

            {/* Premium Header Banner */}
            <div className="relative pt-32 pb-20 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-brand-600/20 to-indigo-600/20 dark:from-brand-600/10 dark:to-indigo-600/10 -z-10" />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full -z-20 opacity-30 dark:opacity-10 pointer-events-none">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500 rounded-full blur-[120px]" />
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500 rounded-full blur-[120px]" />
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row items-center gap-8">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="relative"
                        >
                            <div className="w-32 h-32 rounded-3xl overflow-hidden border-4 border-white dark:border-slate-800 shadow-2xl relative group">

                                <img
                                    src={session?.user?.image || "/images/placeholder-avatar.jpg"}
                                    alt={session?.user?.name || "User"}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                            </div>
                            <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-green-500 border-4 border-white dark:border-slate-900 rounded-2xl shadow-lg" />
                        </motion.div>

                        <div className="flex-1 text-center md:text-left">
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                            >
                                <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">
                                    Hello, {session?.user?.name?.split(' ')[0]}!
                                </h1>
                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-slate-500 dark:text-slate-400">
                                    <div className="flex items-center gap-1.5 px-3 py-1 bg-white/50 dark:bg-slate-800/50 backdrop-blur-md rounded-lg text-sm font-medium border border-slate-200/50 dark:border-slate-700/50">
                                        <Calendar className="w-4 h-4 text-brand-500" />
                                        Joined {stats.memberSince || 'Member'}
                                    </div>
                                    <div className="flex items-center gap-1.5 px-3 py-1 bg-white/50 dark:bg-slate-800/50 backdrop-blur-md rounded-lg text-sm font-medium border border-slate-200/50 dark:border-slate-700/50">
                                        <Package className="w-4 h-4 text-brand-500" />
                                        {stats.totalOrders} Orders
                                    </div>
                                </div>
                            </motion.div>
                        </div>

                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center gap-3"
                        >
                            <button
                                onClick={() => signOut()}
                                className="px-6 py-3 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold rounded-2xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm flex items-center gap-2 group"
                            >
                                <LogOut className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                                Logout
                            </button>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Dashboard Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 -mt-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar Tabs */}
                    <div className="lg:w-72 flex-shrink-0">
                        <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-3xl p-3 border border-white/20 dark:border-slate-700/50 shadow-xl shadow-slate-200/50 dark:shadow-none sticky top-24">
                            <div className="space-y-1">
                                {tabs.map((tab) => {
                                    const Icon = tab.icon;
                                    const isActive = activeTab === tab.id;
                                    return (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id as any)}
                                            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all relative group ${isActive
                                                ? 'text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/20'
                                                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-white'
                                                }`}
                                        >
                                            {isActive && (
                                                <motion.div
                                                    layoutId="activeTabGlow"
                                                    className="absolute inset-0 bg-brand-500/10 dark:bg-brand-400/5 rounded-2xl -z-10"
                                                />
                                            )}
                                            <Icon className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110 ${isActive ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400 dark:text-slate-500'}`} />
                                            {tab.label}
                                            {isActive && (
                                                <motion.div
                                                    layoutId="activeTabIndicator"
                                                    className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-500 dark:bg-brand-400"
                                                />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-700/50 px-4">
                                <div className="p-4 bg-slate-900 dark:bg-slate-950 rounded-2xl relative overflow-hidden group">
                                    <div className="relative z-10">
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Account Tier</p>
                                        <div className="text-white font-black flex items-center gap-2">
                                            Premium Member
                                            <div className="w-2 h-2 rounded-full bg-brand-500 animate-pulse"></div>
                                        </div>
                                    </div>
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-brand-500/20 rounded-full blur-2xl -mr-12 -mt-12 transition-transform duration-500 group-hover:scale-150" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="flex-1">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3, ease: "easeOut" }}
                            >
                                {activeTab === 'personal' && (
                                    <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-slate-700/50 shadow-xl overflow-hidden">
                                        <div className="p-8 border-b border-slate-100 dark:border-slate-700/50">
                                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Profile Details</h3>
                                            <p className="text-slate-500 dark:text-slate-400 text-sm">Update your personal information and address</p>
                                        </div>
                                        <ProfileForm variant={"personal" as "personal"} formData={formData} setFormData={setFormData} />
                                    </div>
                                )}

                                {activeTab === 'orders' && (
                                    <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-slate-700/50 shadow-xl p-2 min-h-[500px]">
                                        <CustomerOrders />
                                    </div>
                                )}

                                {activeTab === 'addresses' && (
                                    <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-slate-700/50 shadow-xl min-h-[500px]">
                                        <ShippingAddresses />
                                    </div>
                                )}


                                {activeTab === 'security' && (
                                    <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-slate-700/50 shadow-xl overflow-hidden">
                                        <div className="p-8 border-b border-slate-100 dark:border-slate-700/50">
                                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Security Settings</h3>
                                            <p className="text-slate-500 dark:text-slate-400 text-sm">Protect your account and change password</p>
                                        </div>
                                        <ProfileForm variant={"security" as "security"} formData={formData} setFormData={setFormData} />
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            <Footer />
        </main>
    );
}
