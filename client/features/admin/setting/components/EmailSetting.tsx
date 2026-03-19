import { motion } from "framer-motion";
import { Mail } from "lucide-react";
export const EmailSetting = ({ formData, setFormData }: any) => {
    return <motion.div
        key="email"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="space-y-6"
    >
        <div className="flex items-center gap-2 mb-2">
            <Mail className="w-5 h-5 text-brand-600" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                SMTP Configuration
            </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5 md:col-span-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    SMTP Host
                </label>
                <input
                    type="text"
                    value={formData.smtp.host}
                    onChange={(e) =>
                        setFormData({
                            ...formData,
                            smtp: { ...formData.smtp, host: e.target.value },
                        })
                    }
                    className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 hover:border-brand-500/50 outline-none transition-all duration-200"
                    placeholder="smtp.example.com"
                />
            </div>

            <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    SMTP Port
                </label>
                <input
                    type="number"
                    value={formData.smtp.port}
                    onChange={(e) =>
                        setFormData({
                            ...formData,
                            smtp: {
                                ...formData.smtp,
                                port: parseInt(e.target.value),
                            },
                        })
                    }
                    className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 hover:border-brand-500/50 outline-none transition-all duration-200"
                    placeholder="587"
                />
            </div>

            <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Encryption (SSL/TLS)
                </label>
                <div className="flex items-center gap-4 h-[58px]">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="radio"
                            checked={formData.smtp.secure}
                            onChange={() =>
                                setFormData({
                                    ...formData,
                                    smtp: { ...formData.smtp, secure: true },
                                })
                            }
                            className="w-4 h-4 text-brand-600"
                        />
                        <span className="text-sm text-slate-700 dark:text-slate-300 font-medium">
                            SSL/TLS
                        </span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="radio"
                            checked={!formData.smtp.secure}
                            onChange={() =>
                                setFormData({
                                    ...formData,
                                    smtp: { ...formData.smtp, secure: false },
                                })
                            }
                            className="w-4 h-4 text-brand-600"
                        />
                        <span className="text-sm text-slate-700 dark:text-slate-300 font-medium">
                            STARTTLS
                        </span>
                    </label>
                </div>
            </div>

            <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Username
                </label>
                <input
                    type="text"
                    value={formData.smtp.user}
                    onChange={(e) =>
                        setFormData({
                            ...formData,
                            smtp: { ...formData.smtp, user: e.target.value },
                        })
                    }
                    className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 hover:border-brand-500/50 outline-none transition-all duration-200"
                    placeholder="user@example.com"
                />
            </div>

            <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Password
                </label>
                <input
                    type="password"
                    value={formData.smtp.pass}
                    onChange={(e) =>
                        setFormData({
                            ...formData,
                            smtp: { ...formData.smtp, pass: e.target.value },
                        })
                    }
                    className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 hover:border-brand-500/50 outline-none transition-all duration-200"
                    placeholder="••••••••"
                />
            </div>

            <div className="space-y-1.5 md:col-span-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Sender Email (From)
                </label>
                <input
                    type="email"
                    value={formData.smtp.from}
                    onChange={(e) =>
                        setFormData({
                            ...formData,
                            smtp: { ...formData.smtp, from: e.target.value },
                        })
                    }
                    className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 hover:border-brand-500/50 outline-none transition-all duration-200"
                    placeholder="noreply@yourdomain.com"
                />
                <p className="text-xs text-slate-500">
                    The email address that will appear in the "From" field
                    of outgoing emails.
                </p>
            </div>
        </div>
    </motion.div>
};