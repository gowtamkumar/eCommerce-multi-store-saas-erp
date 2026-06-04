"use client";

import type { FormEvent } from "react";
import { Edit2, Trash2 } from "lucide-react";
import FormField, { fieldControlClass } from "@/components/shared/FormField";
import Modal from "@/components/shared/Modal";
import type { Warehouse, WarehouseBin, WarehouseBinFormData } from "../../types/organization";

interface WarehouseBinsModalProps {
  open: boolean;
  warehouse: Warehouse | null;
  editingBin: WarehouseBin | null;
  formData: WarehouseBinFormData;
  setFormData: (data: WarehouseBinFormData) => void;
  onClose: () => void;
  onSubmit: () => void;
  onEdit: (bin: WarehouseBin) => void;
  onDelete: (binId: string) => void;
  onCancelEdit: () => void;
}

export function WarehouseBinsModal({
  open,
  warehouse,
  editingBin,
  formData,
  setFormData,
  onClose,
  onSubmit,
  onEdit,
  onDelete,
  onCancelEdit,
}: WarehouseBinsModalProps) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <Modal open={open && !!warehouse} onClose={onClose} maxWidthClassName="max-w-2xl" title="Warehouse Bins">
      {warehouse && (
        <div className="space-y-6">
          <p className="text-slate-500 dark:text-slate-400 text-sm -mt-4">
            Bins in warehouse: <span className="font-bold text-slate-700 dark:text-slate-300">{warehouse.name} ({warehouse.code})</span>
          </p>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 max-h-[65vh] overflow-hidden">
            <div className="md:col-span-2 space-y-4 border-r border-slate-100 dark:border-slate-800 pr-0 md:pr-6">
              <h5 className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                {editingBin ? "Edit Bin Details" : "Create New Bin"}
              </h5>
              <form onSubmit={handleSubmit} className="space-y-4">
                <FormField label="Zone">
                  <input
                    type="text"
                    required
                    value={formData.zone}
                    onChange={(event) => setFormData({ ...formData, zone: event.target.value })}
                    className={fieldControlClass}
                    placeholder="Zone-A"
                  />
                </FormField>
                <FormField label="Bin Code">
                  <input
                    type="text"
                    required
                    value={formData.binCode}
                    onChange={(event) => setFormData({ ...formData, binCode: event.target.value })}
                    className={fieldControlClass}
                    placeholder="A-01-05"
                  />
                </FormField>
                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="bin-active"
                    checked={formData.isActive}
                    onChange={(event) => setFormData({ ...formData, isActive: event.target.checked })}
                    className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                  />
                  <label htmlFor="bin-active" className="text-sm text-slate-700 dark:text-slate-300 font-bold cursor-pointer">
                    Active / Available
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  {editingBin && (
                    <button
                      type="button"
                      onClick={onCancelEdit}
                      className="flex-1 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold rounded-xl text-xs hover:bg-slate-200 transition-all"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2.5 bg-brand-600 text-white font-bold rounded-xl text-xs hover:bg-brand-700 transition-all shadow-md shadow-brand-500/20"
                  >
                    {editingBin ? "Update" : "Add"}
                  </button>
                </div>
              </form>
            </div>

            <div className="md:col-span-3 flex flex-col overflow-hidden min-h-[250px]">
              <h5 className="font-bold text-slate-800 dark:text-slate-200 text-sm mb-3">
                Defined Bins ({warehouse.bins?.length || 0})
              </h5>

              <div className="flex-1 overflow-y-auto pr-1 space-y-3">
                {!warehouse.bins || warehouse.bins.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 text-sm">
                    No bins defined in this warehouse yet.
                  </div>
                ) : (
                  warehouse.bins.map((bin) => (
                    <div
                      key={bin.id}
                      className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100/50 dark:border-slate-800/30"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 dark:text-white text-sm">{bin.binCode}</span>
                          <span className="text-xs text-slate-400 font-mono">({bin.zone})</span>
                        </div>
                        <span className={`inline-block mt-1 text-[10px] font-bold px-1.5 py-0.5 rounded ${bin.isActive ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600" : "bg-slate-100 dark:bg-slate-800 text-slate-400"}`}>
                          {bin.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button type="button" onClick={() => onEdit(bin)} className="p-2 text-slate-400 hover:text-brand-600 transition-colors" title="Edit Bin">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button type="button" onClick={() => onDelete(bin.id)} className="p-2 text-slate-400 hover:text-rose-600 transition-colors" title="Delete Bin">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
