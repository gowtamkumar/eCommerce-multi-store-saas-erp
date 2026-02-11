'use client';

import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle2, Layers, Loader2, Plus, X } from 'lucide-react';
import { useState } from 'react';
import { fetchAPI } from '@/lib/api';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

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
        isActive: initialData?.isActive ?? true,
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
                price: Number(formData.price)
            };

            const endpoint = isEditing ? `/super-admin/plans/${initialData.id}` : '/super-admin/plans';
            const method = isEditing ? 'PATCH' : 'POST';

            const res = await fetchAPI(endpoint, {
                method: method,
                body: JSON.stringify(payload),
            });

            if (res.success) {
                toast.success(`Plan ${isEditing ? 'updated' : 'created'} successfully`);
                router.push('/super-admin/plans');
                router.refresh();
            }
        } catch (error: any) {
            toast.error(error.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors font-semibold"
            >
                <ArrowLeft className="w-4 h-4" />
                Back to Plans
            </button>

            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                        {isEditing ? 'Edit Subscription Tier' : 'Create New Tier'}
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">
                        Define pricing and features for this plan.
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-slate-900 dark:text-white">
                {/* Left Column: Basic Info */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-black uppercase tracking-widest text-slate-400">Plan Name</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g. Pro Platinum"
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-black uppercase tracking-widest text-slate-400">Monthly Price ($)</label>
                                <input
                                    type="number"
                                    required
                                    min="0"
                                    step="0.01"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-black uppercase tracking-widest text-slate-400">Description</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={3}
                                placeholder="Briefly describe who this plan is for..."
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium resize-none"
                            />
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <label className="text-sm font-black uppercase tracking-widest text-slate-400">Features List</label>
                                <button
                                    type="button"
                                    onClick={handleAddFeature}
                                    className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                                >
                                    <Plus className="w-3 h-3" /> Add Feature
                                </button>
                            </div>
                            <div className="space-y-2">
                                {features.map((feature, idx) => (
                                    <div key={idx} className="flex gap-2">
                                        <input
                                            type="text"
                                            value={feature}
                                            onChange={(e) => handleFeatureChange(idx, e.target.value)}
                                            placeholder="e.g. 24/7 Priority Support"
                                            className="flex-1 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm font-medium"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveFeature(idx)}
                                            className="p-2 text-slate-400 hover:text-rose-600 transition-colors"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm space-y-6">
                        <h3 className="text-lg font-bold flex items-center gap-2">
                            <Layers className="w-5 h-5 text-indigo-500" />
                            Plan Details
                        </h3>

                        <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Plan Status</span>
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                                className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${formData.isActive
                                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                    : 'bg-rose-50 text-rose-600 border border-rose-100'}`}
                            >
                                {formData.isActive ? 'Active' : 'Draft'}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl transition-all shadow-xl shadow-indigo-600/20 flex justify-center items-center gap-2 group disabled:opacity-70"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                        {isEditing ? 'Save Tier Changes' : 'Deploy Subscription Tier'}
                    </button>
                </div>
            </form>
        </div>
    );
}
