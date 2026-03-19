"use client";
import { Info, Tag } from "lucide-react";

interface LabelSettingProps {
    formData: any;
    setFormData: (data: any) => void;
}

export default function LabelSetting({ formData, setFormData }: LabelSettingProps) {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Section Header */}
            <div className="flex items-center gap-4 mb-2">
                <div className="p-2.5 bg-brand-100 dark:bg-brand-900/30 rounded-xl text-brand-600 dark:text-brand-400">
                    <Tag className="w-5 h-5" />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Label Configuration</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Manage shop-wide labels and badges</p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
                <div className="p-6 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <div className="flex items-start gap-3 mb-4">
                        <Info className="w-5 h-5 text-brand-600 mt-0.5" />
                        <div className="text-sm text-slate-600 dark:text-slate-400">
                            Configure standard labels that appear on product cards and checkout pages. Currently in development.
                        </div>
                    </div>
                    
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                New Arrival Label Text
                            </label>
                            <input
                                type="text"
                                value={formData.labelSettings?.newArrivalText || "New"}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    labelSettings: { ...formData.labelSettings, newArrivalText: e.target.value }
                                })}
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all outline-none"
                                placeholder="e.g. New"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Best Seller Label Text
                            </label>
                            <input
                                type="text"
                                value={formData.labelSettings?.bestSellerText || "Best Seller"}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    labelSettings: { ...formData.labelSettings, bestSellerText: e.target.value }
                                })}
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all outline-none"
                                placeholder="e.g. Best Seller"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
