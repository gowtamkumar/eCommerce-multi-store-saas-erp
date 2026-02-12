
import { motion } from "framer-motion";
import { Globe, MessageSquare, TrendingUp } from "lucide-react";

export default function MarketingSetting({
    formData,
    setFormData,
}: {
    formData: any;
    setFormData: any;
}) {
    return <motion.div
        key="marketing"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="space-y-6"
    >
        <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-brand-600" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Analytics & Marketing
            </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Google Analytics Section */}
            <div className="space-y-6 p-6 bg-slate-50 dark:bg-slate-900/40 rounded-3xl border border-slate-100 dark:border-slate-700/50">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-700/50">
                    <Globe className="w-4 h-4 text-brand-500" />
                    <h3 className="font-bold text-slate-800 dark:text-slate-200">
                        Google Services
                    </h3>
                </div>
                <div className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-[12px] font-bold text-slate-500 uppercase">
                            Measurement ID
                        </label>
                        <input
                            type="text"
                            value={formData.marketing.googleAnalyticsId}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    marketing: {
                                        ...formData.marketing,
                                        googleAnalyticsId: e.target.value,
                                    },
                                })
                            }
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none text-sm"
                            placeholder="G-XXXXXXXXXX"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[12px] font-bold text-slate-500 uppercase">
                            Site Verification
                        </label>
                        <input
                            type="text"
                            value={formData.marketing.googleSiteVerification}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    marketing: {
                                        ...formData.marketing,
                                        googleSiteVerification: e.target.value,
                                    },
                                })
                            }
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none text-sm"
                            placeholder="Verification code"
                        />
                    </div>
                </div>
            </div>

            {/* Meta Section */}
            <div className="space-y-6 p-6 bg-slate-50 dark:bg-slate-900/40 rounded-3xl border border-slate-100 dark:border-slate-700/50">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-700/50">
                    <MessageSquare className="w-4 h-4 text-blue-500" />
                    <h3 className="font-bold text-slate-800 dark:text-slate-200">
                        Meta (Facebook)
                    </h3>
                </div>
                <div className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-[12px] font-bold text-slate-500 uppercase">
                            Pixel ID
                        </label>
                        <input
                            type="text"
                            value={formData.marketing.facebookPixelId}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    marketing: {
                                        ...formData.marketing,
                                        facebookPixelId: e.target.value,
                                    },
                                })
                            }
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none text-sm"
                            placeholder="123456789..."
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[12px] font-bold text-slate-500 uppercase">
                            Domain Verify
                        </label>
                        <input
                            type="text"
                            value={
                                formData.marketing.facebookDomainVerification
                            }
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    marketing: {
                                        ...formData.marketing,
                                        facebookDomainVerification: e.target.value,
                                    },
                                })
                            }
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none text-sm"
                            placeholder="Verification string"
                        />
                    </div>
                </div>
            </div>
        </div>
    </motion.div>
}