'use client';

import { fetchAPI } from '@/services/api';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle2, Layers, Loader2, Plus, X } from 'lucide-react';
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
    const [features, setFeatures] = useState<string[]>(initialData?.features || ['']);

    const [formData, setFormData] = useState({
        name: initialData?.name || '',
        description: initialData?.description || '',
        price: initialData?.price || 0,
        monthlyPrice: initialData?.monthlyPrice || 0,
        yearlyPrice: initialData?.yearlyPrice || 0,
        billingCycle: initialData?.billingCycle || 'monthly',
        isActive: initialData?.isActive ?? true,
        isPopular: initialData?.isPopular ?? false,
    });

    const handleAddFeature = () => setFeatures([...features, '']);
    const handleRemoveFeature = (index: number) => setFeatures(features.filter((_, i) => i !== index));
    const handleFeatureChange = (index: number, value: string) => {
        const newFeatures = [...features];
        newFeatures[index] = value;
        setFeatures(newFeatures);
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
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Monthly Price ($)</label>
                                <div className="relative group">
                                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 font-black group-focus-within:text-brand-500 transition-colors">$</span>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        step="0.01"
                                        value={formData.monthlyPrice}
                                        onChange={(e) => setFormData({ ...formData, monthlyPrice: Number(e.target.value) })}
                                        className="w-full pl-12 pr-6 py-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-black text-slate-900 dark:text-white"
                                    />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Yearly Price ($)</label>
                                <div className="relative group">
                                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 font-black group-focus-within:text-brand-500 transition-colors">$</span>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        step="0.01"
                                        value={formData.yearlyPrice}
                                        onChange={(e) => setFormData({ ...formData, yearlyPrice: Number(e.target.value) })}
                                        className="w-full pl-12 pr-6 py-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-black text-slate-900 dark:text-white"
                                    />
                                </div>
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

                        <div className="space-y-6">
                            <div className="flex justify-between items-center pb-4 border-b border-slate-50 dark:border-slate-800">
                                <div className="space-y-0.5">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Core Entitlements</label>
                                    <p className="text-xs text-slate-400 font-medium ml-1">Add features that define this subscription tier.</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleAddFeature}
                                    className="px-4 py-2 bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-brand-100 dark:hover:bg-brand-900/40 transition-all flex items-center gap-2"
                                >
                                    <Plus className="w-3.5 h-3.5" strokeWidth={3} /> Add Item
                                </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {features.map((feature, idx) => (
                                    <motion.div 
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        key={idx} 
                                        className="flex gap-2 group"
                                    >
                                        <div className="relative flex-1">
                                            <CheckCircle2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                                            <input
                                                type="text"
                                                value={feature}
                                                onChange={(e) => handleFeatureChange(idx, e.target.value)}
                                                placeholder="e.g. 100GB Cloud Storage"
                                                className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 outline-none focus:ring-2 focus:ring-brand-500/10 focus:border-brand-500 transition-all text-sm font-bold text-slate-700 dark:text-slate-200"
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveFeature(idx)}
                                            className="p-3 text-slate-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-all"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </motion.div>
                                ))}
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
