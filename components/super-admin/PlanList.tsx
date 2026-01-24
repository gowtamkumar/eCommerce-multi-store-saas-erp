'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Edit2, Layers, Plus, Search, Trash2, CheckCircle2, XCircle } from 'lucide-react';
import { useState } from 'react';
import { fetchAPI } from '@/lib/api';
import { toast } from 'react-hot-toast';

interface SubscriptionPlan {
    id: string;
    name: string;
    description: string;
    price: number;
    features: string[];
    isActive: boolean;
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
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Subscription Plans</h1>
                    <p className="text-slate-500 dark:text-slate-400">Manage the tiers and pricing for your merchants.</p>
                </div>
                <div className="flex gap-4 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search plans..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                        />
                    </div>
                    <button
                        onClick={() => window.location.href = '/super-admin/plans/create'}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all text-sm font-semibold shadow-lg shadow-indigo-600/20"
                    >
                        <Plus className="w-4 h-4" />
                        Create Plan
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence mode="popLayout">
                    {filteredPlans.map((plan) => (
                        <motion.div
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            key={plan.id}
                            className={`bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 overflow-hidden shadow-sm hover:shadow-md transition-all ${!plan.isActive ? 'opacity-75' : ''}`}
                        >
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${plan.isActive ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-100 dark:border-indigo-800 text-indigo-500' : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400'}`}>
                                        <Layers className="w-6 h-6" />
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleToggleActive(plan.id, plan.isActive)}
                                            disabled={loadingId === plan.id}
                                            className={`p-2 rounded-xl border transition-all ${plan.isActive ? 'text-emerald-500 bg-emerald-50/50 border-emerald-100' : 'text-rose-500 bg-rose-50/50 border-rose-100'}`}
                                            title={plan.isActive ? 'Deactivate' : 'Activate'}
                                        >
                                            {plan.isActive ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                                        </button>
                                        <button
                                            onClick={() => window.location.href = `/super-admin/plans/${plan.id}/edit`}
                                            className="p-2 text-slate-400 hover:text-indigo-600 transition-colors bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-xl"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(plan.id)}
                                            disabled={loadingId === plan.id}
                                            className="p-2 text-slate-400 hover:text-rose-600 transition-colors bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-xl"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">{plan.name}</h3>
                                <p className="text-3xl font-black text-indigo-600 dark:text-indigo-400 mb-4">
                                    ${plan.price}<span className="text-sm font-bold text-slate-400 uppercase tracking-widest ml-1">/mo</span>
                                </p>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 line-clamp-2 h-10">
                                    {plan.description || 'No description provided.'}
                                </p>

                                <div className="space-y-3">
                                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Included Features</p>
                                    <ul className="space-y-2">
                                        {(plan.features || []).slice(0, 3).map((feature, idx) => (
                                            <li key={idx} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                                {feature}
                                            </li>
                                        ))}
                                        {plan.features?.length > 3 && (
                                            <li className="text-xs font-bold text-slate-400 ml-6">
                                                + {plan.features.length - 3} more features
                                            </li>
                                        )}
                                    </ul>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                    {filteredPlans.length === 0 && (
                        <div className="col-span-full py-20 text-center bg-white dark:bg-slate-800 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700">
                            <Layers className="w-12 h-12 text-slate-300 mx-auto mb-4 opacity-20" />
                            <p className="text-slate-400 italic">No subscription plans found.</p>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
