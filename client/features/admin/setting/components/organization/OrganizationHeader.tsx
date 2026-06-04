"use client";

import { Building2 } from "lucide-react";
import type { OrganizationTab } from "../../types/organization";

interface OrganizationHeaderProps {
  activeTab: OrganizationTab;
  onTabChange: (tab: OrganizationTab) => void;
}

export function OrganizationHeader({ activeTab, onTabChange }: OrganizationHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-brand-600" />
          Organization Management
        </h3>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          Manage your branches, warehouses, and storage locations.
        </p>
      </div>

      <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
        <button
          type="button"
          onClick={() => onTabChange("branches")}
          className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === "branches" ? "bg-white dark:bg-slate-700 text-brand-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
        >
          Branches
        </button>
        <button
          type="button"
          onClick={() => onTabChange("warehouses")}
          className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === "warehouses" ? "bg-white dark:bg-slate-700 text-brand-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
        >
          Warehouses
        </button>
      </div>
    </div>
  );
}
