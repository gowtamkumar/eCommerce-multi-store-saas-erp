"use client";

import { motion } from "framer-motion";
import { Building2, Edit2, MapPin, Package, Trash2, Warehouse as WarehouseIcon } from "lucide-react";
import type { Warehouse } from "../../types/organization";

interface WarehouseCardProps {
  warehouse: Warehouse;
  onEdit: (warehouse: Warehouse) => void;
  onDelete: (id: string) => void;
  onManageBins: (warehouse: Warehouse) => void;
}

export function WarehouseCard({ warehouse, onEdit, onDelete, onManageBins }: WarehouseCardProps) {
  return (
    <motion.div
      layout
      className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all group"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-brand-50 dark:bg-brand-900/20 rounded-2xl">
          <WarehouseIcon className="w-6 h-6 text-brand-600" />
        </div>
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button type="button" onClick={() => onEdit(warehouse)} className="p-2 text-slate-400 hover:text-brand-600 transition-colors">
            <Edit2 className="w-4 h-4" />
          </button>
          <button type="button" onClick={() => onDelete(warehouse.id)} className="p-2 text-slate-400 hover:text-rose-600 transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <h5 className="text-lg font-bold text-slate-900 dark:text-white mb-1">{warehouse.name}</h5>
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xs font-mono text-slate-400">{warehouse.code}</span>
        <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded text-[10px] font-bold uppercase">
          {warehouse.locationType}
        </span>
      </div>

      {warehouse.branch && (
        <div className="mb-4 flex items-center gap-2 text-xs font-bold text-brand-600 bg-brand-50 dark:bg-brand-900/20 px-2 py-1 rounded-lg w-fit">
          <Building2 className="w-3 h-3" />
          {warehouse.branch.name}
        </div>
      )}

      <div className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
        {warehouse.address && (
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            <span className="truncate">{warehouse.address}</span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <Package className="w-4 h-4" />
          <span>{warehouse.bins?.length || 0} Bins Defined</span>
        </div>
      </div>

      <button
        type="button"
        onClick={() => onManageBins(warehouse)}
        className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all border border-slate-100 dark:border-slate-800/30"
      >
        <Package className="w-3.5 h-3.5" />
        Manage Bins
      </button>
    </motion.div>
  );
}
