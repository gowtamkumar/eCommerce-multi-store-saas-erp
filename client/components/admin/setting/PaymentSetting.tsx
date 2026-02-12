import { motion } from "framer-motion";
import { CreditCard } from "lucide-react";
export default function PaymentSetting({ formData, setFormData }: any) {
    return <motion.div
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Stripe Section */}
            <div className="space-y-1.5 md:col-span-2">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                    Stripe Configuration
                </h3>
                <div className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                            Publishable Key
                        </label>
                        <input
                            type="text"
                            value={formData.payment.stripePublishableKey}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    payment: {
                                        ...formData.payment,
                                        stripePublishableKey: e.target.value,
                                    },
                                })
                            }
                            className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 hover:border-brand-500/50 outline-none transition-all duration-200"
                            placeholder="pk_test_..."
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                            Secret Key
                        </label>
                        <input
                            type="password"
                            value={formData.payment.stripeSecretKey}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    payment: {
                                        ...formData.payment,
                                        stripeSecretKey: e.target.value,
                                    },
                                })
                            }
                            className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 hover:border-brand-500/50 outline-none transition-all duration-200"
                            placeholder="sk_test_..."
                        />
                    </div>
                </div>
            </div>

            <div className="w-full h-px bg-slate-200 dark:bg-slate-800 md:col-span-2" />

            {/* SSL Commerce Section */}
            <div className="space-y-1.5 md:col-span-2">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                    SSL Commerce Configuration
                </h3>
                <div className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                            Store ID
                        </label>
                        <input
                            type="text"
                            value={formData.payment.sslCommerzStoreId}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    payment: {
                                        ...formData.payment,
                                        sslCommerzStoreId: e.target.value,
                                    },
                                })
                            }
                            className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 hover:border-brand-500/50 outline-none transition-all duration-200"
                            placeholder="Enter Store ID"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                            Store Password
                        </label>
                        <input
                            type="password"
                            value={formData.payment.sslCommerzStorePassword}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    payment: {
                                        ...formData.payment,
                                        sslCommerzStorePassword: e.target.value,
                                    },
                                })
                            }
                            className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 hover:border-brand-500/50 outline-none transition-all duration-200"
                            placeholder="Enter Store Password"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.payment.sslCommerzIsSandbox}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        payment: {
                                            ...formData.payment,
                                            sslCommerzIsSandbox: e.target.checked,
                                        },
                                    })
                                }
                                className="w-4 h-4 text-brand-600 rounded focus:ring-brand-500"
                            />
                            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                Sandbox Mode
                            </span>
                        </label>
                        <p className="text-xs text-slate-500 pl-6">
                            Enable this for testing payments without real
                            transactions.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </motion.div>;
}