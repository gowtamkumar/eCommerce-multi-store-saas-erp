import React, { memo, useCallback } from "react";
import { motion } from "framer-motion";
import { Share2 } from "lucide-react";

/**
 * Isolated input component for individual social links.
 * Prevents global re-renders when a single URL is updated.
 */
const SocialLinkItem = memo(({ name, value, onChange }: any) => {
    return (
        <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 capitalize">
                {name} Profile URL
            </label>
            <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500 transition-colors">
                    <Share2 className="w-4 h-4" />
                </span>
                <input
                    type="url"
                    value={value}
                    onChange={(e) => onChange(name, e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 hover:border-brand-500/50 outline-none transition-all duration-200"
                    placeholder={`https://${name}.com/yourstore`}
                />
            </div>
        </div>
    );
});

SocialLinkItem.displayName = "SocialLinkItem";

function SocialSetting({
    formData,
    setFormData,
}: {
    formData: any;
    setFormData: any;
}) {
    // Memoized change handler to avoid unnecessary child re-renders
    const handleLinkChange = useCallback((key: string, value: string) => {
        setFormData((prev: any) => ({
            ...prev,
            socialLinks: {
                ...prev.socialLinks,
                [key]: value,
            },
        }));
    }, [setFormData]);

    return (
        <motion.div
            key="social"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
        >
            <div className="flex items-center gap-2 mb-2">
                <div className="p-2 bg-brand-100 dark:bg-brand-900/30 rounded-lg">
                    <Share2 className="w-5 h-5 text-brand-600" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    Social Presence
                </h2>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {Object.keys(formData.socialLinks).map((key) => (
                    <SocialLinkItem
                        key={key}
                        name={key}
                        value={(formData.socialLinks as any)[key]}
                        onChange={handleLinkChange}
                    />
                ))}
            </div>
        </motion.div>
    );
}

export default memo(SocialSetting);