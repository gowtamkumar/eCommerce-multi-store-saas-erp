"use client";

import { Plus } from "lucide-react";
import type { Warehouse } from "../../types/organization";
import { WarehouseCard } from "./WarehouseCard";

interface WarehousesPanelProps {
  warehouses: Warehouse[];
  onCreate: () => void;
  onEdit: (warehouse: Warehouse) => void;
  onDelete: (id: string) => void;
  onManageBins: (warehouse: Warehouse) => void;
}

export function WarehousesPanel({ warehouses, onCreate, onEdit, onDelete, onManageBins }: WarehousesPanelProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h4 className="text-lg font-bold text-slate-900 dark:text-white">Warehouses</h4>
        <button
          type="button"
          onClick={onCreate}
          className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-bold transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Warehouse
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {warehouses.map((warehouse) => (
          <WarehouseCard
            key={warehouse.id}
            warehouse={warehouse}
            onEdit={onEdit}
            onDelete={onDelete}
            onManageBins={onManageBins}
          />
        ))}
      </div>
    </div>
  );
}
