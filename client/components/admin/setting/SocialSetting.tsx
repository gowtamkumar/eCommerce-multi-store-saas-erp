import { motion } from "framer-motion";
import { Share2 } from "lucide-react";

export default function SocialSetting({
    formData,
    setFormData,
}: {
    formData: any;
    setFormData: any;
}) {
    return <motion.div
        key="social"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="space-y-6"
    >
        <div className="flex items-center gap-2 mb-2">
            <Share2 className="w-5 h-5 text-brand-600" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Social Presence
            </h2>
        </div>

        <div className="grid grid-cols-1 gap-6">
            {Object.keys(formData.socialLinks).map((key) => (
                <div key={key} className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 capitalize">
                        {key} Profile URL
                    </label>
                    <div className="relative group">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500 transition-colors">
                            <Share2 className="w-4 h-4" />
                        </span>
                        <input
                            type="url"
                            value={(formData.socialLinks as any)[key]}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    socialLinks: {
                                        ...formData.socialLinks,
                                        [key]: e.target.value,
                                    },
                                })
                            }
                            className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 hover:border-brand-500/50 outline-none transition-all duration-200"
                            placeholder={`https://${key}.com/yourstore`}
                        />
                    </div>
                </div>
            ))}
        </div>
    </motion.div>
}