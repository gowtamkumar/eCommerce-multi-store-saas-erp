"use client";

import { Loader2, Plus } from "lucide-react";

interface AddDomainFormProps {
  domainInput: string;
  isUpdating: boolean;
  onDomainInputChange: (value: string) => void;
  onAddDomain: () => void;
}

export function AddDomainForm({ domainInput, isUpdating, onDomainInputChange, onAddDomain }: AddDomainFormProps) {
  return (
    <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
      <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
        Add Custom Domain
      </h3>
      <div className="flex flex-col sm:flex-row gap-4">
        <input
          type="text"
          value={domainInput}
          onChange={(event) => onDomainInputChange(event.target.value.toLowerCase())}
          placeholder="e.g., shop.yourbrand.com"
          className="flex-1 px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all duration-200"
        />
        <button
          type="button"
          onClick={onAddDomain}
          disabled={isUpdating || !domainInput}
          className="px-6 py-3.5 bg-slate-900 dark:bg-slate-100 dark:text-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all disabled:opacity-50 flex items-center gap-2"
        >
          {isUpdating && <Loader2 className="w-4 h-4 animate-spin" />}
          <Plus className="w-4 h-4" /> Add Domain
        </button>
      </div>
    </div>
  );
}
