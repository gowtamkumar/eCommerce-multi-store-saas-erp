"use client";

import { Database } from "lucide-react";

export function SystemHeader() {
  return (
    <div>
      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
        <Database className="w-5 h-5 text-brand-600" />
        System & Performance
      </h3>
      <p className="text-slate-500 dark:text-slate-400 text-sm">
        Manage your store&apos;s performance and system maintenance tasks.
      </p>
    </div>
  );
}
