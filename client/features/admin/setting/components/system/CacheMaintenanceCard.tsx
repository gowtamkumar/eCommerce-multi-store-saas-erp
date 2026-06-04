"use client";

import { motion } from "framer-motion";
import { Trash2, Zap } from "lucide-react";

interface CacheMaintenanceCardProps {
  clearing: boolean;
  onConfirmClear: () => void;
}

export function CacheMaintenanceCard({ clearing, onConfirmClear }: CacheMaintenanceCardProps) {
  return (
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
        onClick={onConfirmClear}
        disabled={clearing}
        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-white dark:bg-slate-800 text-rose-600 border border-rose-100 dark:border-rose-900/30 hover:bg-rose-50 dark:hover:bg-rose-900/20 font-bold rounded-xl transition-all disabled:opacity-50"
      >
        <Trash2 className="w-5 h-5" />
        <span>Clear Store Cache</span>
      </button>
    </motion.div>
  );
}
