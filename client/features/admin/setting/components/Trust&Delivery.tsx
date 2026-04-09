import React, { memo, useCallback } from "react";
import { Plus, Trash2, ShieldCheck, Heart, Truck, Award, Headphones, CreditCard } from "lucide-react";

const BadgeItem = memo(({ badge, index, onUpdate, onRemove }: any) => {
    return (
        <div className="relative group p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-800 hover:border-brand-500/30 transition-all">
            <button
                type="button"
                onClick={() => onRemove(index)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-red-500 transition-colors"
            >
                <Trash2 className="w-4 h-4" />
            </button>

            <div className="space-y-4">
                <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">Icon Name (Lucide)</label>
                    <input
                        type="text"
                        value={badge.icon || ''}
                        onChange={(e) => onUpdate(index, 'icon', e.target.value)}
                        placeholder="Truck, ShieldCheck, Heart..."
                        className="w-full px-4 py-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-sm font-bold focus:ring-2 focus:ring-brand-500/20 outline-none transition-all"
                    />
                </div>
                <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">Title</label>
                    <input
                        type="text"
                        value={badge.title || ''}
                        onChange={(e) => onUpdate(index, 'title', e.target.value)}
                        placeholder="e.g., Free Returns"
                        className="w-full px-4 py-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-sm font-bold focus:ring-2 focus:ring-brand-500/20 outline-none transition-all"
                    />
                </div>
                <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">Sub-text</label>
                    <textarea
                        value={badge.description || ''}
                        onChange={(e) => onUpdate(index, 'description', e.target.value)}
                        placeholder="e.g., On all orders over $50"
                        rows={2}
                        className="w-full px-4 py-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-sm font-bold focus:ring-2 focus:ring-brand-500/20 outline-none transition-all resize-none"
                    />
                </div>
            </div>
        </div>
    );
});

BadgeItem.displayName = "BadgeItem";

function TrustDelivery({ formData, setFormData }: any) {
    const handleUpdateBadge = useCallback((index: number, field: string, value: string) => {
        setFormData((prev: any) => {
            const newBadges = [...(prev.trustBadges || [])];
            newBadges[index] = { ...newBadges[index], [field]: value };
            return { ...prev, trustBadges: newBadges };
        });
    }, [setFormData]);

    const handleRemoveBadge = useCallback((index: number) => {
        setFormData((prev: any) => ({
            ...prev,
            trustBadges: prev.trustBadges.filter((_: any, i: number) => i !== index)
        }));
    }, [setFormData]);

    const handleAddBadge = useCallback(() => {
        setFormData((prev: any) => ({
            ...prev,
            trustBadges: [...(prev.trustBadges || []), { title: '', description: '', icon: 'Truck' }]
        }));
    }, [setFormData]);

    return (
        <div className="max-w-6xl mx-auto my-12">
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 p-8 md:p-12 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Trust & Delivery Highlights</h2>
                        <p className="text-slate-500 text-sm">Manage the confidence-building badges shown on product pages (e.g., Free Return, Fast Shipping).</p>
                    </div>
                    <button
                        type="button"
                        onClick={handleAddBadge}
                        className="p-3 bg-brand-50 dark:bg-brand-900/20 text-brand-600 rounded-2xl hover:bg-brand-100 transition-colors flex items-center gap-2 font-bold text-sm"
                    >
                        <Plus className="w-5 h-5" />
                        Add Badge
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {(formData.trustBadges || []).map((badge: any, index: number) => (
                        <BadgeItem
                            key={index}
                            badge={badge}
                            index={index}
                            onUpdate={handleUpdateBadge}
                            onRemove={handleRemoveBadge}
                        />
                    ))}

                    {(formData.trustBadges || []).length === 0 && (
                        <div className="col-span-full py-12 flex flex-col items-center justify-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[2.5rem]">
                            <ShieldCheck className="w-12 h-12 text-slate-300 mb-4" />
                            <p className="text-slate-500 font-bold">No trust badges added yet.</p>
                            <p className="text-slate-400 text-xs">Add badges to build customer confidence.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default memo(TrustDelivery);