"use client";

import { Plus } from "lucide-react";
import type { Branch } from "../../types/organization";
import { BranchCard } from "./BranchCard";

interface BranchesPanelProps {
  branches: Branch[];
  onCreate: () => void;
  onEdit: (branch: Branch) => void;
  onDelete: (id: string) => void;
}

export function BranchesPanel({ branches, onCreate, onEdit, onDelete }: BranchesPanelProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h4 className="text-lg font-bold text-slate-900 dark:text-white">Branches</h4>
        <button
          type="button"
          onClick={onCreate}
          className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-bold transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Branch
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {branches.map((branch) => (
          <BranchCard key={branch.id} branch={branch} onEdit={onEdit} onDelete={onDelete} />
        ))}
      </div>
    </div>
  );
}
