'use client';

import { fetchAPI } from '@/services/api';
import { getFeatureDisplay } from '@/routes';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, Edit2, Layers, Plus, Search, Trash2, XCircle } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

interface SubscriptionPlan {
    id: string;
    name: string;
    description: string;
    price: number;
    monthlyPrice: number;
    yearlyPrice: number;
    features: string[];
    billingCycle: string;
    isActive: boolean;
    isPopular: boolean;
    createdAt: string;
}

interface PlanListProps {
    initialPlans: SubscriptionPlan[];
}

export default function PlanList({ initialPlans }: PlanListProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [plans, setPlans] = useState(initialPlans);
    const [loadingId, setLoadingId] = useState<string | null>(null);

    const filteredPlans = plans.filter((p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleToggleActive = async (id: string, currentStatus: boolean) => {
        setLoadingId(id);
        try {
            const res = await fetchAPI(`/super-admin/plans/${id}`, {
                method: 'PATCH',
                body: JSON.stringify({ isActive: !currentStatus }),
            });

            if (res.success) {
                setPlans(plans.map(p => p.id === id ? { ...p, isActive: !currentStatus } : p));
                toast.success(`Plan ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to update status');
        } finally {
            setLoadingId(null);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this plan?')) return;

        setLoadingId(id);
        try {
            const res = await fetchAPI(`/super-admin/plans/${id}`, {
                method: 'DELETE',
            });

            if (res.success) {
                setPlans(plans.filter(p => p.id !== id));
                toast.success('Plan deleted successfully');
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to delete plan');
        } finally {
            setLoadingId(null);
        }
    };

    return (
        <div className="space-y-10 pb-20">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm">
                <div className="space-y-1">
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Subscription Tiers</h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">Architect your SaaS revenue model with precision.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                    <div className="relative flex-1 sm:w-80 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-brand-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Filter tiers by name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-sm font-bold"
                        />
                    </div>
                    <Link
                        href="/system/plans/create"
                        className="flex items-center justify-center gap-2 px-8 py-3.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl hover:bg-slate-800 dark:hover:bg-slate-100 transition-all text-sm font-black uppercase tracking-widest shadow-xl active:scale-[0.98]"
                    >
                        <Plus className="w-5 h-5" strokeWidth={3} />
                        New Tier
                    </Link>
                </div>
            </div>

            {/* Grid Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <AnimatePresence mode="popLayout">
                    {filteredPlans.map((plan) => (
                        <motion.div
                            layout
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            key={plan.id}
                            className={`group relative bg-white dark:bg-slate-900 rounded-[2.5rem] border transition-all duration-300 overflow-hidden hover:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] ${!plan.isActive ? 'border-dashed border-slate-200 dark:border-slate-800 opacity-80' : 'border-slate-100 dark:border-slate-800 shadow-sm'}`}
                        >
                            {/* Card Background Decoration */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/5 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-brand-500/10 transition-colors" />

                            <div className="p-8 relative z-10">
                                <div className="flex justify-between items-start mb-8">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border-2 transition-transform group-hover:scale-110 duration-500 ${plan.isActive ? 'bg-brand-50 dark:bg-brand-900/20 border-brand-100 dark:border-brand-900/50 text-brand-600' : 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-400'}`}>
                                        <Layers className="w-7 h-7" />
                                    </div>
                                    
                                     <div className="flex gap-2">
                                         <button
                                             onClick={() => handleToggleActive(plan.id, plan.isActive)}
                                             disabled={loadingId === plan.id}
                                             className={`p-2.5 rounded-xl border transition-all hover:scale-110 active:scale-95 ${plan.isActive ? 'text-emerald-500 bg-emerald-50/50 border-emerald-100 dark:bg-emerald-950/20 dark:border-emerald-900/50 dark:text-emerald-400' : 'text-slate-400 bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-500'}`}
                                             title={plan.isActive ? 'Deactivate' : 'Activate'}
                                         >
                                             {loadingId === plan.id ? <div className="w-5 h-5 border-2 border-current border-t-transparent animate-spin rounded-full" /> : (plan.isActive ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />)}
                                         </button>
                                         <div className="w-px h-8 bg-slate-100 dark:bg-slate-800 mx-1 self-center" />
                                         <Link
                                             href={`/system/plans/${plan.id}/edit`}
                                             className="p-2.5 text-slate-400 hover:text-brand-600 transition-all hover:bg-brand-50 dark:hover:bg-brand-900/20 rounded-xl hover:scale-110"
                                         >
                                             <Edit2 className="w-5 h-5" />
                                         </Link>
                                         <button
                                             onClick={() => handleDelete(plan.id)}
                                             disabled={loadingId === plan.id}
                                             className="p-2.5 text-slate-400 hover:text-rose-600 transition-all hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl hover:scale-110"
                                         >
                                             <Trash2 className="w-5 h-5" />
                                         </button>
                                     </div>
                                </div>

                                <div className="mb-6">
                                    <div className="flex items-center gap-2 mb-2">
                                        <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{plan.name}</h3>
                                        <div className="flex gap-1">
                                            {!plan.isActive && <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-full">Draft</span>}
                                            {plan.isPopular && <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 bg-brand-100 dark:bg-brand-900/40 text-brand-600 rounded-full">Popular</span>}
                                        </div>
                                    </div>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed line-clamp-2 h-10">
                                        {plan.description || 'Provide a compelling description for this tier.'}
                                    </p>
                                </div>

                                <div className="mb-6 space-y-1">
                                    <p className="text-2xl font-black text-slate-900 dark:text-white">
                                        ${plan.monthlyPrice}<span className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">/ mo</span>
                                    </p>
                                    <p className="text-xl font-black text-slate-400 dark:text-slate-500">
                                        ${plan.yearlyPrice}<span className="text-[10px] font-bold uppercase tracking-widest ml-1">/ yr</span>
                                    </p>
                                </div>

                                <div className="space-y-4 pt-6 border-t border-slate-50 dark:border-slate-800">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Core Entitlements</p>
                                    <ul className="space-y-3">
                                        {(plan.features || []).slice(0, 4).map((feature, idx) => {
                                            const display = getFeatureDisplay(feature);
                                            const FeatureIcon = display.icon || CheckCircle2;
                                            return (
                                                <li key={idx} className="flex items-center gap-2.5 text-xs font-bold text-slate-600 dark:text-slate-300">
                                                    <div className="p-1 bg-brand-50 dark:bg-brand-900/20 text-brand-600 rounded-lg shrink-0">
                                                        <FeatureIcon className="w-3.5 h-3.5" />
                                                    </div>
                                                    <span className="truncate">{display.label}</span>
                                                </li>
                                            );
                                        })}
                                        {plan.features?.length > 4 && (
                                            <li className="text-[10px] font-black text-brand-500 pl-8 pt-1">
                                                + {plan.features.length - 4} Advanced Features
                                            </li>
                                        )}
                                        {(!plan.features || plan.features.length === 0) && (
                                            <li className="text-xs italic text-slate-400 pl-1">No features defined.</li>
                                        )}
                                    </ul>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                    {filteredPlans.length === 0 && (
                        <div className="col-span-full py-32 text-center bg-white dark:bg-slate-900 rounded-[3rem] border-2 border-dashed border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center group shadow-sm">
                            <div className="w-20 h-20 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                                <Layers className="w-10 h-10 text-slate-300" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No tiers found</h3>
                            <p className="text-slate-400 font-medium">Try refining your search or create a new subscription tier.</p>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
