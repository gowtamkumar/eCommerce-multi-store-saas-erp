import React, { useState, memo } from "react";
import { motion } from "framer-motion";
import { CreditCard, Eye, EyeOff } from "lucide-react";

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

const StripeConfigSection = memo(({ payment, onChange }: any) => (
    <div className="space-y-1.5 md:col-span-2">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
            Stripe Configuration
        </h3>
        <div className="space-y-4">
            <InputField
                label="Publishable Key"
                value={payment.stripePublishableKey}
                onChange={(val: string) => onChange("stripePublishableKey", val)}
                placeholder="pk_test_..."
            />
            <InputField
                label="Secret Key"
                isSecret
                value={payment.stripeSecretKey}
                onChange={(val: string) => onChange("stripeSecretKey", val)}
                placeholder="sk_test_..."
            />
        </div>
    </div>
));

StripeConfigSection.displayName = "StripeConfigSection";

const SSLCommerzConfigSection = memo(({ payment, onChange }: any) => (
    <div className="space-y-1.5 md:col-span-2">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
            SSL Commerce Configuration
        </h3>
        <div className="space-y-4">
            <InputField
                label="Store ID"
                value={payment.sslCommerzStoreId}
                onChange={(val: string) => onChange("sslCommerzStoreId", val)}
                placeholder="Enter Store ID"
            />
            <InputField
                label="Store Password"
                isSecret
                value={payment.sslCommerzStorePassword}
                onChange={(val: string) => onChange("sslCommerzStorePassword", val)}
                placeholder="Enter Store Password"
            />
            <div className="space-y-1.5">
                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={payment.sslCommerzIsSandbox}
                        onChange={(e) => onChange("sslCommerzIsSandbox", e.target.checked)}
                        className="w-4 h-4 text-brand-600 rounded focus:ring-brand-500"
                    />
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Sandbox Mode
                    </span>
                </label>
                <p className="text-xs text-slate-500 pl-6">
                    Enable this for testing payments without real transactions.
                </p>
            </div>
        </div>
    </div>
));

SSLCommerzConfigSection.displayName = "SSLCommerzConfigSection";

function PaymentSetting({ formData, setFormData }: any) {
    const handlePaymentChange = React.useCallback((field: string, value: any) => {
        setFormData((prev: any) => ({
            ...prev,
            payment: {
                ...prev.payment,
                [field]: value,
            },
        }));
    }, [setFormData]);

    return (
        <motion.div
            key="payment"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
        >
            <div className="flex items-center gap-2 mb-2">
                <CreditCard className="w-5 h-5 text-brand-600" />
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    Payment Credentials
                </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <StripeConfigSection 
                    payment={formData.payment} 
                    onChange={handlePaymentChange} 
                />

                <div className="w-full h-px bg-slate-200 dark:bg-slate-800 md:col-span-2" />

                <SSLCommerzConfigSection 
                    payment={formData.payment} 
                    onChange={handlePaymentChange} 
                />
            </div>
        </motion.div>
    );
}

export default memo(PaymentSetting);