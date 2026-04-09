"use client";
import React, { memo, useCallback } from "react";
import { Info, Tag } from "lucide-react";

interface LabelSettingProps {
    formData: any;
    setFormData: (data: any) => void;
}

const StandardLabelInput = memo(({ label, value, onChange, placeholder }: any) => (
    <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            {label}
        </label>
        <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all outline-none"
            placeholder={placeholder}
        />
    </div>
));

StandardLabelInput.displayName = "StandardLabelInput";

function LabelSetting({ formData, setFormData }: LabelSettingProps) {
    const handleLabelChange = useCallback((field: string, value: string) => {
        setFormData((prev: any) => ({
            ...prev,
            labelSettings: { ...prev.labelSettings, [field]: value }
        }));
    }, [setFormData]);

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
                        <div className="p-1 bg-brand-50 dark:bg-brand-900/20 rounded-lg">
                            <Info className="w-4 h-4 text-brand-600" />
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">
                            Configure standard labels that appear on product cards and checkout pages.
                        </div>
                    </div>
                    
                    <div className="space-y-6">
                        <StandardLabelInput
                            label="New Arrival Label Text"
                            value={formData.labelSettings?.newArrivalText || "New"}
                            onChange={(val: string) => handleLabelChange('newArrivalText', val)}
                            placeholder="e.g. New"
                        />

                        <StandardLabelInput
                            label="Best Seller Label Text"
                            value={formData.labelSettings?.bestSellerText || "Best Seller"}
                            onChange={(val: string) => handleLabelChange('bestSellerText', val)}
                            placeholder="e.g. Best Seller"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default memo(LabelSetting);
