"use client";

import { Globe } from "lucide-react";

export function DomainHeader() {
  return (
    <div className="flex items-center gap-2 mb-2">
      <Globe className="w-5 h-5 text-brand-600" />
      <h2 className="text-xl font-bold text-slate-900 dark:text-white">
        Domains Management
      </h2>
    </div>
  );
}
