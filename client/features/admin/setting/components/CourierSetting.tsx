import React, { useState, memo, useCallback } from "react";
import { motion } from "framer-motion";
import { Truck, Eye, EyeOff, Globe, MapPin, CreditCard } from "lucide-react";

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
                className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 hover:border-brand-500/50 outline-none transition-all duration-200"
                placeholder={placeholder}
            />
        </div>
    );
});

InputField.displayName = "InputField";

const PathaoSection = memo(({ pathaoCourier, onChange }: any) => (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Globe className="w-5 h-5 text-orange-500" />
            Pathao Courier Settings
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField
                label="Pathao Client ID"
                value={pathaoCourier.pathaoClientId}
                onChange={(val: string) => onChange("pathaoCourier", "pathaoClientId", val)}
                placeholder="Enter Client ID"
            />
            <InputField
                label="Pathao Client Secret"
                isSecret
                value={pathaoCourier.pathaoClientSecret}
                onChange={(val: string) => onChange("pathaoCourier", "pathaoClientSecret", val)}
                placeholder="Enter Client Secret"
            />
            <InputField
                label="Pathao Username"
                value={pathaoCourier.pathaoUsername}
                onChange={(val: string) => onChange("pathaoCourier", "pathaoUsername", val)}
                placeholder="Enter Username"
            />
            <InputField
                label="Pathao Password"
                isSecret
                value={pathaoCourier.pathaoPassword}
                onChange={(val: string) => onChange("pathaoCourier", "pathaoPassword", val)}
                placeholder="Enter Pathao Password"
            />
            <InputField
                label="Pathao Store ID"
                value={pathaoCourier.pathaoStoreId}
                onChange={(val: string) => onChange("pathaoCourier", "pathaoStoreId", val)}
                placeholder="Enter Pathao Store ID"
            />
            <div className="space-y-1.5 md:col-span-2">
                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={pathaoCourier.sandboxMode}
                        onChange={(e) => onChange("pathaoCourier", "sandboxMode", e.target.checked)}
                        className="w-4 h-4 text-brand-600 rounded focus:ring-brand-500"
                    />
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Sandbox Mode
                    </span>
                </label>
                <p className="text-xs text-slate-500 pl-6">
                    Enable this for testing configuration without real transactions.
                </p>
            </div>
        </div>
    </div>
));

PathaoSection.displayName = "PathaoSection";

const SteadfastSection = memo(({ steadfastCourier, onChange }: any) => (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm mt-6">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-500" />
            Steadfast Courier Settings
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField
                label="API Key"
                value={steadfastCourier.apiKey}
                onChange={(val: string) => onChange("steadfastCourier", "apiKey", val)}
                placeholder="Enter API Key"
            />
            <InputField
                label="Secret Key"
                isSecret
                value={steadfastCourier.secretKey}
                onChange={(val: string) => onChange("steadfastCourier", "secretKey", val)}
                placeholder="Enter Secret Key"
            />
        </div>
    </div>
));

SteadfastSection.displayName = "SteadfastSection";

const EasyPostSection = memo(({ shippingConfig, onChange }: any) => (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm mt-6">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Globe className="w-5 h-5 text-indigo-500" />
            EasyPost Logistics Settings (Global Fulfillment)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField
                label="EasyPost API Key"
                isSecret
                value={shippingConfig.easyPostApiKey || ""}
                onChange={(val: string) => onChange("shippingConfig", "easyPostApiKey", val)}
                placeholder="EZTK..."
            />
            <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    EasyPost Mode
                </label>
                <select
                    value={shippingConfig.easyPostMode || "test"}
                    onChange={(e) => onChange("shippingConfig", "easyPostMode", e.target.value)}
                    className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 hover:border-brand-500/50 outline-none transition-all duration-200"
                >
                    <option value="test">Test</option>
                    <option value="production">Production</option>
                </select>
            </div>
            <div className="md:col-span-2 space-y-4 pt-4 border-t border-slate-100 dark:border-slate-700/50">
                <h4 className="text-sm font-bold text-slate-850 dark:text-slate-200">Origin Warehouse Address</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                        <InputField
                            label="Origin Address line 1"
                            value={shippingConfig.originAddress || ""}
                            onChange={(val: string) => onChange("shippingConfig", "originAddress", val)}
                            placeholder="123 Export Blvd"
                        />
                    </div>
                    <InputField
                        label="Origin City"
                        value={shippingConfig.originCity || ""}
                        onChange={(val: string) => onChange("shippingConfig", "originCity", val)}
                        placeholder="San Francisco"
                    />
                    <InputField
                        label="Origin State"
                        value={shippingConfig.originState || ""}
                        onChange={(val: string) => onChange("shippingConfig", "originState", val)}
                        placeholder="CA"
                    />
                    <InputField
                        label="Origin Postal Code"
                        value={shippingConfig.originPostalCode || ""}
                        onChange={(val: string) => onChange("shippingConfig", "originPostalCode", val)}
                        placeholder="94107"
                    />
                    <InputField
                        label="Origin Country"
                        value={shippingConfig.originCountry || ""}
                        onChange={(val: string) => onChange("shippingConfig", "originCountry", val)}
                        placeholder="US"
                    />
                </div>
            </div>
        </div>
    </div>
));

EasyPostSection.displayName = "EasyPostSection";

const ShippingRatesSection = memo(({ shippingConfig, onChange }: any) => (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm mt-6">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-emerald-500" />
            Shipping Rates & Thresholds
        </h3>
        <p className="text-sm text-slate-500 mb-6">Set the default flat delivery rates for Inside City and Outside City deliveries.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Inside City Fee</label>
                <input
                    type="number"
                    min="0"
                    value={shippingConfig.insideCityFee}
                    onChange={(e) => onChange("shippingConfig", "insideCityFee", Number(e.target.value))}
                    className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 hover:border-brand-500/50 outline-none transition-all duration-200"
                    placeholder="e.g. 60"
                />
            </div>
            <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Outside City Fee</label>
                <input
                    type="number"
                    min="0"
                    value={shippingConfig.outsideCityFee}
                    onChange={(e) => onChange("shippingConfig", "outsideCityFee", Number(e.target.value))}
                    className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 hover:border-brand-500/50 outline-none transition-all duration-200"
                    placeholder="e.g. 120"
                />
            </div>
            <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Free Shipping Threshold</label>
                <input
                    type="number"
                    min="0"
                    value={shippingConfig.freeShippingThreshold}
                    onChange={(e) => onChange("shippingConfig", "freeShippingThreshold", Number(e.target.value))}
                    className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 hover:border-brand-500/50 outline-none transition-all duration-200"
                    placeholder="e.g. 5000 (0 to disable)"
                />
            </div>
        </div>
    </div>
));

ShippingRatesSection.displayName = "ShippingRatesSection";

function CourierSetting({ formData, setFormData }: any) {
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
            key="courier"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
        >
            <div className="flex items-center gap-2 mb-2">
                <div className="p-2 bg-brand-100 dark:bg-brand-900/30 rounded-lg">
                    <Truck className="w-5 h-5 text-brand-600" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    Courier & Shipping Configuration
                </h2>
            </div>

            <PathaoSection 
                pathaoCourier={formData.pathaoCourier} 
                onChange={handleFieldChange} 
            />

            <SteadfastSection 
                steadfastCourier={formData.steadfastCourier} 
                onChange={handleFieldChange} 
            />

            <EasyPostSection 
                shippingConfig={formData.shippingConfig} 
                onChange={handleFieldChange} 
            />

            <ShippingRatesSection 
                shippingConfig={formData.shippingConfig} 
                onChange={handleFieldChange} 
            />
        </motion.div>
    );
}

export default memo(CourierSetting);