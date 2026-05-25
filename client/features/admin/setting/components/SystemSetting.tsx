"use client";
import { fetchAPI } from "@/services/api";
import { motion, AnimatePresence } from "framer-motion";
import { Database, Loader2, Trash2, Zap, AlertTriangle, X } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

export function SystemSetting() {
    const [clearing, setClearing] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const handleClearCache = async () => {
        setClearing(true);
        try {
            await fetchAPI("/settings/cache/clear", {
                method: "POST",
            });
            toast.success("Store cache cleared successfully!");
            setShowConfirm(false);
        } catch (error) {
            console.error("Failed to clear cache", error);
            toast.error("Failed to clear store cache");
        } finally {
            setClearing(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
                    <Database className="w-5 h-5 text-brand-600" />
                    System & Performance
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm">
                    Manage your store's performance and system maintenance tasks.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div
                    whileHover={{ y: -2 }}
                    className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 transition-all"
                >
                    <div className="flex items-start justify-between mb-4">
                        <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-2xl">
                            <Zap className="w-6 h-6 text-amber-600" />
                        </div>
                    </div>
                    <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Redis Cache</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                        We use cache catalogs, settings, and pages for blazing fast performance.
                        Clear the cache if you notice outdated data on your storefront.
                    </p>
                    <button
                        type="button"
                        onClick={() => setShowConfirm(true)}
                        disabled={clearing}
                        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-white dark:bg-slate-800 text-rose-600 border border-rose-100 dark:border-rose-900/30 hover:bg-rose-50 dark:hover:bg-rose-900/20 font-bold rounded-xl transition-all disabled:opacity-50"
                    >
                        <Trash2 className="w-5 h-5" />
                        <span>Clear Store Cache</span>
                    </button>
                </motion.div>
            </div>

            {/* Custom Premium Confirmation Modal */}
            <AnimatePresence>
                {showConfirm && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => !clearing && setShowConfirm(false)}
                            className="absolute inset-0 bg-slate-950/40 dark:bg-slate-950/60 backdrop-blur-sm"
                        />

                        {/* Modal Container */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            transition={{ type: "spring", duration: 0.3 }}
                            className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl relative z-10 space-y-6"
                        >
                            {/* Close Button */}
                            <button
                                type="button"
                                disabled={clearing}
                                onClick={() => setShowConfirm(false)}
                                className="absolute right-4 top-4 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors disabled:opacity-50"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            {/* Header / Icon */}
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 rounded-2xl shrink-0">
                                    <AlertTriangle className="w-6 h-6" />
                                </div>
                                <h4 className="text-lg font-black text-slate-900 dark:text-white">
                                    Clear Store Cache?
                                </h4>
                            </div>

                            {/* Message */}
                            <div className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                                Are you sure you want to clear the store cache? This will clear all cached catalogs, settings, and pages. While the cache is being rebuilt, your store's response times might temporarily slow down.
                            </div>

                            {/* Actions */}
                            <div className="flex items-center justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    disabled={clearing}
                                    onClick={() => setShowConfirm(false)}
                                    className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200/80 dark:hover:bg-slate-800 rounded-2xl transition-all disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    disabled={clearing}
                                    onClick={handleClearCache}
                                    className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 active:bg-rose-800 rounded-2xl shadow-lg shadow-rose-600/20 hover:shadow-rose-700/30 transition-all disabled:opacity-50"
                                >
                                    {clearing ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            <span>Clearing...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Trash2 className="w-4 h-4" />
                                            <span>Clear Cache</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
