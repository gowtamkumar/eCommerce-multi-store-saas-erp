'use client';

import { fetchAPI } from '@/services/api';
import { navGroups } from '@/routes';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle2, Layers, Loader2, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'react-hot-toast';

interface PlanFormProps {
    initialData?: any;
    isEditing?: boolean;
}

export default function PlanForm({ initialData, isEditing = false }: PlanFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [features, setFeatures] = useState<string[]>(initialData?.features || []);

    const [formData, setFormData] = useState({
        name: initialData?.name || '',
        description: initialData?.description || '',
        price: initialData?.price || 0,
        monthlyPrice: initialData?.monthlyPrice || 0,
        yearlyPrice: initialData?.yearlyPrice || 0,
        billingCycle: initialData?.billingCycle || 'monthly',
        isActive: initialData?.isActive ?? true,
        isPopular: initialData?.isPopular ?? false,
        trialPeriodDays: initialData?.trialPeriodDays ?? 14,
        code: initialData?.code || '',
        currency: initialData?.currency || 'USD',
        maxBranches: initialData?.maxBranches ?? 1,
        maxWarehouses: initialData?.maxWarehouses ?? 1,
        maxStaffUsers: initialData?.maxStaffUsers ?? 3,
        maxProducts: initialData?.maxProducts ?? 100,
        maxMonthlyOrders: initialData?.maxMonthlyOrders ?? 500,
        maxStorageMb: initialData?.maxStorageMb ?? 1024,
        stripePriceIdMonthly: initialData?.stripePriceIdMonthly || '',
        stripePriceIdYearly: initialData?.stripePriceIdYearly || '',
    });

    const toggleFeature = (key: string) => {
        setFeatures(prev =>
            prev.includes(key)
                ? prev.filter(f => f !== key)
                : [...prev, key]
        );
    };

    const toggleGroup = (groupFeatures: string[]) => {
        const allSelected = groupFeatures.every(f => features.includes(f));
        if (allSelected) {
            setFeatures(prev => prev.filter(f => !groupFeatures.includes(f)));
        } else {
            setFeatures(prev => [...new Set([...prev, ...groupFeatures])]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const payload = {
                ...formData,
                features: features.filter(f => f.trim() !== ''),
                price: Number(formData.price),
                monthlyPrice: Number(formData.monthlyPrice),
                yearlyPrice: Number(formData.yearlyPrice),
                trialPeriodDays: Number(formData.trialPeriodDays),
                maxBranches: Number(formData.maxBranches),
                maxWarehouses: Number(formData.maxWarehouses),
                maxStaffUsers: Number(formData.maxStaffUsers),
                maxProducts: Number(formData.maxProducts),
                maxMonthlyOrders: Number(formData.maxMonthlyOrders),
                maxStorageMb: Number(formData.maxStorageMb),
                stripePriceIdMonthly: formData.stripePriceIdMonthly.trim() || null,
                stripePriceIdYearly: formData.stripePriceIdYearly.trim() || null,
                code: formData.code.trim() || null,
            };

            const endpoint = isEditing ? `/super-admin/plans/${initialData.id}` : '/super-admin/plans';
            const method = isEditing ? 'PATCH' : 'POST';

            const res = await fetchAPI(endpoint, {
                method: method,
                body: JSON.stringify(payload),
            });

            if (res.success) {
                toast.success(`Plan ${isEditing ? 'updated' : 'created'} successfully`);
                router.push('/system/plans');
                router.refresh();
            }
        } catch (error: any) {
            toast.error(error.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-10 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden">
                <div className="relative z-10 space-y-2">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-slate-400 hover:text-brand-600 transition-all font-bold text-xs uppercase tracking-widest mb-4 group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Back to Tiers
                    </button>
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                        {isEditing ? 'Refine Tier' : 'Architect New Tier'}
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium max-w-md">
                        Configure the pricing, core entitlements, and operational status for this subscription level.
                    </p>
                </div>
                <div className="absolute top-0 right-0 w-48 h-48 bg-brand-500/5 rounded-full blur-3xl -mr-20 -mt-20" />
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Left Column: Configuration */}
                <div className="lg:col-span-8 space-y-10">
                    <div className="bg-white dark:bg-slate-900 p-10 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm space-y-10">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Tier Name</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g. Enterprise Elite"
                                    className="w-full px-6 py-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-bold text-slate-900 dark:text-white placeholder:text-slate-400"
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Plan Code</label>
                                <input
                                    type="text"
                                    value={formData.code}
                                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                    placeholder="e.g. enterprise-elite"
                                    className="w-full px-6 py-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-bold text-slate-900 dark:text-white placeholder:text-slate-400"
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Currency</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.currency}
                                    onChange={(e) => setFormData({ ...formData, currency: e.target.value.toUpperCase() })}
                                    placeholder="e.g. USD"
                                    maxLength={3}
                                    className="w-full px-6 py-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-bold text-slate-900 dark:text-white placeholder:text-slate-400"
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Monthly Price</label>
                                <div className="relative group">
                                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 font-black group-focus-within:text-brand-500 transition-colors">{formData.currency}</span>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        step="0.01"
                                        value={formData.monthlyPrice}
                                        onChange={(e) => setFormData({ ...formData, monthlyPrice: Number(e.target.value) })}
                                        className="w-full pl-16 pr-6 py-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-black text-slate-900 dark:text-white"
                                    />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Yearly Price</label>
                                <div className="relative group">
                                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 font-black group-focus-within:text-brand-500 transition-colors">{formData.currency}</span>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        step="0.01"
                                        value={formData.yearlyPrice}
                                        onChange={(e) => setFormData({ ...formData, yearlyPrice: Number(e.target.value) })}
                                        className="w-full pl-16 pr-6 py-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-black text-slate-900 dark:text-white"
                                    />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Trial Period (Days)</label>
                                <input
                                    type="number"
                                    required
                                    min="0"
                                    value={formData.trialPeriodDays}
                                    onChange={(e) => setFormData({ ...formData, trialPeriodDays: Number(e.target.value) })}
                                    className="w-full px-6 py-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-bold text-slate-900 dark:text-white placeholder:text-slate-400"
                                />
                            </div>
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Tier Narrative</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={3}
                                placeholder="Describe the ideal user for this tier and the value it provides..."
                                className="w-full px-6 py-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-bold text-slate-900 dark:text-white placeholder:text-slate-400 resize-none leading-relaxed"
                            />
                        </div>

                        {/* Stripe Integration */}
                        <div className="space-y-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                            <div className="space-y-1">
                                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Stripe Integration</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Link this plan with Stripe price identifiers for automated customer billing.</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Stripe Monthly Price ID</label>
                                    <input
                                        type="text"
                                        value={formData.stripePriceIdMonthly}
                                        onChange={(e) => setFormData({ ...formData, stripePriceIdMonthly: e.target.value })}
                                        placeholder="e.g. price_1Q..."
                                        className="w-full px-6 py-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-bold text-slate-900 dark:text-white placeholder:text-slate-400"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Stripe Yearly Price ID</label>
                                    <input
                                        type="text"
                                        value={formData.stripePriceIdYearly}
                                        onChange={(e) => setFormData({ ...formData, stripePriceIdYearly: e.target.value })}
                                        placeholder="e.g. price_1Q..."
                                        className="w-full px-6 py-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-bold text-slate-900 dark:text-white placeholder:text-slate-400"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Resource Quotas */}
                        <div className="space-y-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                            <div className="space-y-1">
                                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Resource Quotas</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Define maximum limits for core database records and assets on this plan tier.</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Max Branches</label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        value={formData.maxBranches}
                                        onChange={(e) => setFormData({ ...formData, maxBranches: Number(e.target.value) })}
                                        className="w-full px-6 py-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-bold text-slate-900 dark:text-white placeholder:text-slate-400"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Max Warehouses</label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        value={formData.maxWarehouses}
                                        onChange={(e) => setFormData({ ...formData, maxWarehouses: Number(e.target.value) })}
                                        className="w-full px-6 py-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-bold text-slate-900 dark:text-white placeholder:text-slate-400"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Max Staff Users</label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        value={formData.maxStaffUsers}
                                        onChange={(e) => setFormData({ ...formData, maxStaffUsers: Number(e.target.value) })}
                                        className="w-full px-6 py-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-bold text-slate-900 dark:text-white placeholder:text-slate-400"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Max Products</label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        value={formData.maxProducts}
                                        onChange={(e) => setFormData({ ...formData, maxProducts: Number(e.target.value) })}
                                        className="w-full px-6 py-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-bold text-slate-900 dark:text-white placeholder:text-slate-400"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Max Monthly Orders</label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        value={formData.maxMonthlyOrders}
                                        onChange={(e) => setFormData({ ...formData, maxMonthlyOrders: Number(e.target.value) })}
                                        className="w-full px-6 py-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-bold text-slate-900 dark:text-white placeholder:text-slate-400"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Max Storage (MB)</label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        value={formData.maxStorageMb}
                                        onChange={(e) => setFormData({ ...formData, maxStorageMb: Number(e.target.value) })}
                                        className="w-full px-6 py-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-bold text-slate-900 dark:text-white placeholder:text-slate-400"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-8">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
                                <div className="space-y-1">
                                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Core Entitlements</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Select the features that define this subscription tier.</p>
                                </div>
                                <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/50 p-1.5 rounded-xl border border-slate-100 dark:border-slate-800">
                                    <button
                                        type="button"
                                        onClick={() => setFeatures(navGroups.flatMap(g => g.items.map((i: any) => i.feature)).filter(Boolean))}
                                        className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-slate-500 hover:text-brand-600 transition-colors"
                                    >
                                        Select All
                                    </button>
                                    <div className="w-px h-4 bg-slate-200 dark:bg-slate-700" />
                                    <button
                                        type="button"
                                        onClick={() => setFeatures([])}
                                        className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-slate-500 hover:text-rose-600 transition-colors"
                                    >
                                        Clear All
                                    </button>
                                </div>
                            </div>

                            <div className="columns-1 md:columns-2 gap-8 space-y-8">
                                {navGroups.map((group: any) => {
                                    const seenFeatures = new Set<string>();
                                    const filteredItems: any[] = [];
                                    
                                    for (const item of group.items) {
                                        if (
                                            item.feature &&
                                            item.type !== 'header' &&
                                            item.href !== '/admin/profile' &&
                                            item.href !== '/admin/settings/billing'
                                        ) {
                                            if (!seenFeatures.has(item.feature)) {
                                                seenFeatures.add(item.feature);
                                                // Enhance label slightly if it is generic like "Dashboard" inside HRM or Finance
                                                let displayLabel = item.label;
                                                if (displayLabel === 'Dashboard' && group.title !== 'Insights') {
                                                    displayLabel = `${group.title} Dashboard`;
                                                }
                                                filteredItems.push({
                                                    ...item,
                                                    label: displayLabel
                                                });
                                            }
                                        }
                                    }
                                    
                                    if (filteredItems.length === 0) return null;

                                    const groupFeatureKeys = filteredItems.map(i => i.feature);
                                    const isGroupAllSelected = groupFeatureKeys.every(f => features.includes(f));

                                    return (
                                        <div key={group.title} className="break-inside-avoid space-y-4 bg-slate-50/30 dark:bg-slate-800/10 p-6 rounded-3xl border border-slate-100/50 dark:border-slate-800/30">
                                            <div className="flex justify-between items-center px-1">
                                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{group.title}</h4>
                                                <button
                                                    type="button"
                                                    onClick={() => toggleGroup(groupFeatureKeys)}
                                                    className={`text-[9px] font-black uppercase tracking-widest transition-colors ${isGroupAllSelected ? 'text-rose-500 hover:text-rose-600' : 'text-brand-500 hover:text-brand-600'}`}
                                                >
                                                    {isGroupAllSelected ? 'Deselect Group' : 'Select Group'}
                                                </button>
                                            </div>
                                            <div className="space-y-2.5">
                                                {filteredItems.map((item: any) => (
                                                    <label key={item.feature} className={`flex items-center gap-3 p-3.5 rounded-2xl border transition-all cursor-pointer group ${features.includes(item.feature) ? 'bg-white dark:bg-slate-900 border-brand-500 shadow-md shadow-brand-500/5 ring-1 ring-brand-500/50' : 'bg-white/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 hover:border-brand-500/30 hover:bg-white dark:hover:bg-slate-900'}`}>
                                                        <div className="relative flex items-center justify-center flex-shrink-0">
                                                            <input
                                                                type="checkbox"
                                                                checked={features.includes(item.feature)}
                                                                onChange={() => toggleFeature(item.feature)}
                                                                className="w-5 h-5 rounded-md border-2 border-slate-300 dark:border-slate-700 appearance-none checked:bg-brand-500 checked:border-brand-500 transition-all peer cursor-pointer"
                                                            />
                                                            <CheckCircle2 className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" strokeWidth={4} />
                                                        </div>
                                                        <div className="flex items-center gap-3 flex-1">
                                                            <div className={`p-2 rounded-xl transition-colors ${features.includes(item.feature) ? 'bg-brand-100 dark:bg-brand-500/20 text-brand-600 dark:text-brand-400' : 'bg-slate-100/50 dark:bg-slate-800/50 text-slate-400 group-hover:text-brand-500'}`}>
                                                                <item.icon className="w-3.5 h-3.5" />
                                                            </div>
                                                            <span className={`text-[13px] font-bold transition-colors ${features.includes(item.feature) ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white'}`}>
                                                                {item.label}
                                                            </span>
                                                        </div>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Meta & Actions */}
                <div className="lg:col-span-4 space-y-8">
                    <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm space-y-8">
                        <div className="space-y-4">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1 flex items-center gap-2">
                                <Layers className="w-4 h-4 text-brand-500" />
                                Tier Intelligence
                            </h3>

                            <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <span className="text-sm font-black text-slate-900 dark:text-white">Active Status</span>
                                        <p className="text-[10px] text-slate-400 font-medium italic">Visible to public?</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                                        className={`w-14 h-7 rounded-full p-1 relative transition-colors ${formData.isActive ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'}`}
                                    >
                                        <div className={`w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-300 ${formData.isActive ? 'translate-x-7' : 'translate-x-0'}`} />
                                    </button>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <span className="text-sm font-black text-slate-900 dark:text-white">Most Popular</span>
                                        <p className="text-[10px] text-slate-400 font-medium italic">Highlight this tier?</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, isPopular: !formData.isPopular })}
                                        className={`w-14 h-7 rounded-full p-1 relative transition-colors ${formData.isPopular ? 'bg-brand-500' : 'bg-slate-300 dark:bg-slate-700'}`}
                                    >
                                        <div className={`w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-300 ${formData.isPopular ? 'translate-x-7' : 'translate-x-0'}`} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <p className="text-[10px] text-slate-400 font-medium px-2 leading-relaxed italic">
                                Once deployed, this tier will be immediately available for new and existing merchants to subscribe to.
                            </p>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black text-[13px] uppercase tracking-[0.2em] rounded-[1.5rem] transition-all shadow-xl hover:shadow-brand-500/20 active:scale-[0.98] flex justify-center items-center gap-3 disabled:opacity-70 group"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse group-hover:scale-125 transition-transform" />}
                                {isEditing ? 'Sync Changes' : 'Deploy Tier'}
                            </button>
                        </div>
                    </div>

                    {/* Summary Preview Card */}
                    <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-brand-600 to-indigo-700 text-white shadow-xl shadow-brand-500/30 overflow-hidden relative group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-700" />
                        <div className="relative z-10 space-y-4">
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Live Preview</p>
                            <div>
                                <h4 className="text-2xl font-black tracking-tight">{formData.name || 'Untitled Tier'}</h4>
                                <div className="flex items-baseline gap-2 pt-1">
                                    <p className="text-3xl font-black">${formData.monthlyPrice}</p>
                                    <span className="text-sm opacity-60">monthly</span>
                                </div>
                                <div className="flex items-baseline gap-2">
                                    <p className="text-xl font-black opacity-80">${formData.yearlyPrice}</p>
                                    <span className="text-xs opacity-60">yearly</span>
                                </div>
                            </div>
                            <div className="w-full h-px bg-white/20" />
                            <p className="text-xs font-medium opacity-80 leading-relaxed italic line-clamp-2">
                                {formData.description || 'Start drafting to see the narrative here.'}
                            </p>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
