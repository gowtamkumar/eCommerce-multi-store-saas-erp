"use client";

import { motion } from "framer-motion";
import { Building2, Edit2, Mail, MapPin, Phone, Trash2 } from "lucide-react";
import type { Branch } from "../../types/organization";

interface BranchCardProps {
  branch: Branch;
  onEdit: (branch: Branch) => void;
  onDelete: (id: string) => void;
}

export function BranchCard({ branch, onEdit, onDelete }: BranchCardProps) {
  return (
    <motion.div
      layout
      className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all group"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-brand-50 dark:bg-brand-900/20 rounded-2xl">
          <Building2 className="w-6 h-6 text-brand-600" />
        </div>
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button type="button" onClick={() => onEdit(branch)} className="p-2 text-slate-400 hover:text-brand-600 transition-colors">
            <Edit2 className="w-4 h-4" />
          </button>
          <button type="button" onClick={() => onDelete(branch.id)} className="p-2 text-slate-400 hover:text-rose-600 transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <h5 className="text-lg font-bold text-slate-900 dark:text-white mb-1">{branch.name}</h5>
      <p className="text-xs font-mono text-slate-400 mb-4">{branch.code}</p>

      <div className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
        {branch.address && (
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            <span className="truncate">{branch.address}</span>
          </div>
        )}
        {branch.phone && (
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4" />
            <span>{branch.phone}</span>
          </div>
        )}
        {branch.email && (
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4" />
            <span className="truncate">{branch.email}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
