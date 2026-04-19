import React, { useState, memo, useCallback } from "react";
import { motion } from "framer-motion";
import { MessageSquare, Eye, EyeOff, ShieldCheck, Zap } from "lucide-react";

/**
 * Reusable InputField with visibility toggle for secrets.
 */
const InputField = memo(({ label, type = "text", value, onChange, placeholder, isSecret }: any) => {
    const [showSecret, setShowSecret] = useState(false);
    const inputType = isSecret ? (showSecret ? "text" : "password") : type;

    return (
        <div className="space-y-1.5">
            <div className="flex justify-between items-center">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    {label}
                </label>
                {isSecret && (
                    <button
                        type="button"
                        onClick={() => setShowSecret(!showSecret)}
                        className="text-slate-400 hover:text-brand-500 transition-colors"
                    >
                        {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                )}
            </div>
            <input
                type={inputType}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 hover:border-brand-500/50 outline-none transition-all duration-200 font-display"
                placeholder={placeholder}
            />
        </div>
    );
});

InputField.displayName = "InputField";

const BulksmsbdSection = memo(({ sms, onChange }: any) => (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-500" />
                Bulksmsbd API Configuration
            </h3>
            <span className="px-2.5 py-1 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 text-[10px] font-black uppercase tracking-wider rounded-lg border border-amber-100 dark:border-amber-900/30">
                Primary Provider
            </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField
                label="API Key"
                isSecret
                value={sms?.apiKey || ""}
                onChange={(val: string) => onChange("sms", "apiKey", val)}
                placeholder="Enter your Bulksmsbd API Key"
            />
            <InputField
                label="Sender ID"
                value={sms?.senderId || ""}
                onChange={(val: string) => onChange("sms", "senderId", val)}
                placeholder="Enter your approved Sender ID (e.g., 8809612...)"
            />
        </div>
        
        <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
            <div className="flex gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                <div>
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">Configuration Note</p>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                        Ensure your Sender ID is approved by Bulksmsbd to avoid delivery failures. 
                        If left blank, the system will fallback to the global default configuration if available.
                    </p>
                </div>
            </div>
        </div>
    </div>
));

BulksmsbdSection.displayName = "BulksmsbdSection";

function SmsSetting({ formData, setFormData }: any) {
    const handleFieldChange = useCallback((module: string, field: string, value: any) => {
        setFormData((prev: any) => ({
            ...prev,
            [module]: {
                ...prev[module],
                [field]: value,
            },
        }));
    }, [setFormData]);

    return (
        <motion.div
            key="sms"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
        >
            <div className="flex items-center gap-2 mb-2">
                <div className="p-2 bg-brand-100 dark:bg-brand-900/30 rounded-lg">
                    <MessageSquare className="w-5 h-5 text-brand-600" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white font-display">
                    SMS Gateway Settings
                </h2>
            </div>

            <BulksmsbdSection 
                sms={formData.sms} 
                onChange={handleFieldChange} 
            />
        </motion.div>
    );
}

export default memo(SmsSetting);
