import { motion } from "framer-motion";

export default function CourierSetting({ formData, setFormData }: any) {
    return <motion.div
        key="courier"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.2 }}
        className="space-y-6"
    >
        <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-brand-100 dark:bg-brand-900/30 rounded-lg">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-5 h-5 text-brand-600"
                >
                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                </svg>
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Courier Configuration
            </h2>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* <div className="space-y-1.5 md:col-span-2">
                                                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                                        Pathao Base URL
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={formData.pathaoCourier.pathaoBaseUrl}
                                                        onChange={(e) =>
                                                            setFormData({
                                                                ...formData,
                                                                pathaoCourier: {
                                                                    ...formData.pathaoCourier,
                                                                    pathaoBaseUrl: e.target.value,
                                                                },
                                                            })
                                                        }
                                                        className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 hover:border-brand-500/50 outline-none transition-all duration-200"
                                                        placeholder="https://api-hermes.pathao.com"
                                                    />
                                                </div> */}

                <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Pathao Client ID
                    </label>
                    <input
                        type="text"
                        value={formData.pathaoCourier.pathaoClientId}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                pathaoCourier: {
                                    ...formData.pathaoCourier,
                                    pathaoClientId: e.target.value,
                                },
                            })
                        }
                        className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 hover:border-brand-500/50 outline-none transition-all duration-200"
                        placeholder="Enter Client ID"
                    />
                </div>

                <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Pathao Client Secret
                    </label>
                    <input
                        type="password"
                        value={formData.pathaoCourier.pathaoClientSecret}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                pathaoCourier: {
                                    ...formData.pathaoCourier,
                                    pathaoClientSecret: e.target.value,
                                },
                            })
                        }
                        className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 hover:border-brand-500/50 outline-none transition-all duration-200"
                        placeholder="Enter Client Secret"
                    />
                </div>

                <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Pathao Username
                    </label>
                    <input
                        type="text"
                        value={formData.pathaoCourier.pathaoUsername}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                pathaoCourier: {
                                    ...formData.pathaoCourier,
                                    pathaoUsername: e.target.value,
                                },
                            })
                        }
                        className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 hover:border-brand-500/50 outline-none transition-all duration-200"
                        placeholder="Enter Username"
                    />
                </div>

                <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Pathao Password
                    </label>
                    <input
                        type="password"
                        value={formData.pathaoCourier.pathaoPassword}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                pathaoCourier: {
                                    ...formData.pathaoCourier,
                                    pathaoPassword: e.target.value,
                                },
                            })
                        }
                        className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 hover:border-brand-500/50 outline-none transition-all duration-200"
                        placeholder="Enter Pathao Password"
                    />
                </div>

                <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Pathao Store ID
                    </label>
                    <input
                        type="text"
                        value={formData.pathaoCourier.pathaoStoreId}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                pathaoCourier: {
                                    ...formData.pathaoCourier,
                                    pathaoStoreId: e.target.value,
                                },
                            })
                        }
                        className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 hover:border-brand-500/50 outline-none transition-all duration-200"
                        placeholder="Enter Pathao Store ID"
                    />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={formData.pathaoCourier.sandboxMode}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    pathaoCourier: {
                                        ...formData.pathaoCourier,
                                        sandboxMode: e.target.checked,
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
                        Enable this for testing configation without real
                        transactions.
                    </p>
                </div>
            </div>
        </div>

        {/* Steadfast Courier Section */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm mt-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Steadfast Courier Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        API Key
                    </label>
                    <input
                        type="text"
                        value={formData.steadfastCourier.apiKey}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                steadfastCourier: {
                                    ...formData.steadfastCourier,
                                    apiKey: e.target.value,
                                },
                            })
                        }
                        className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 hover:border-brand-500/50 outline-none transition-all duration-200"
                        placeholder="Enter API Key"
                    />
                </div>

                <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Secret Key
                    </label>
                    <input
                        type="password"
                        value={formData.steadfastCourier.secretKey}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                steadfastCourier: {
                                    ...formData.steadfastCourier,
                                    secretKey: e.target.value,
                                },
                            })
                        }
                        className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 hover:border-brand-500/50 outline-none transition-all duration-200"
                        placeholder="Enter Secret Key"
                    />
                </div>
            </div>
        </div>

        {/* Shipping Rates Configuration */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm mt-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Shipping Rates & Thresholds</h3>
            <p className="text-sm text-slate-500 mb-6">Set the default flat delivery rates for Inside City and Outside City deliveries.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Inside City Fee
                    </label>
                    <input
                        type="number"
                        min="0"
                        value={formData.shippingConfig.insideCityFee}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                shippingConfig: {
                                    ...formData.shippingConfig,
                                    insideCityFee: Number(e.target.value),
                                },
                            })
                        }
                        className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 hover:border-brand-500/50 outline-none transition-all duration-200"
                        placeholder="e.g. 60"
                    />
                </div>

                <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Outside City Fee
                    </label>
                    <input
                        type="number"
                        min="0"
                        value={formData.shippingConfig.outsideCityFee}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                shippingConfig: {
                                    ...formData.shippingConfig,
                                    outsideCityFee: Number(e.target.value),
                                },
                            })
                        }
                        className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 hover:border-brand-500/50 outline-none transition-all duration-200"
                        placeholder="e.g. 120"
                    />
                </div>

                <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Free Shipping Threshold
                    </label>
                    <input
                        type="number"
                        min="0"
                        value={formData.shippingConfig.freeShippingThreshold}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                shippingConfig: {
                                    ...formData.shippingConfig,
                                    freeShippingThreshold: Number(e.target.value),
                                },
                            })
                        }
                        className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 hover:border-brand-500/50 outline-none transition-all duration-200"
                        placeholder="e.g. 5000 (0 to disable)"
                    />
                </div>
            </div>
        </div>
    </motion.div>
}