"use client";
import { fetchAPI } from "@/services/api";
import { motion } from "framer-motion";
import { Database, Loader2, Trash2, Zap } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

export function SystemSetting() {
    const [clearing, setClearing] = useState(false);

    const handleClearCache = async () => {
        if (!confirm("Are you sure? This will clear all cached data for your store. Performance may be temporarily affected while the cache is rebuilt.")) {
            return;
        }

        setClearing(true);
        try {
            await fetchAPI("/settings/cache/clear", {
                method: "POST",
            });
            toast.success("Store cache cleared successfully!");
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
                        onClick={handleClearCache}
                        disabled={clearing}
                        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-white dark:bg-slate-800 text-rose-600 border border-rose-100 dark:border-rose-900/30 hover:bg-rose-50 dark:hover:bg-rose-900/20 font-bold rounded-xl transition-all disabled:opacity-50"
                    >
                        {clearing ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <>
                                <Trash2 className="w-5 h-5" />
                                <span>Clear Store Cache</span>
                            </>
                        )}
                    </button>
                </motion.div>
            </div>
        </div>
    );
}
