"use client";

import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, FileSpreadsheet, X } from "lucide-react";
import { ConvertRequisitionModalProps } from "../types";
import { useConvertRequisitionModal } from "../hooks/useConvertRequisitionModal";

export default function ConvertRequisitionModal({
  isOpen,
  onClose,
  pr,
  onSuccess,
}: ConvertRequisitionModalProps) {
  const {
    suppliers,
    selectedSupplierId,
    setSelectedSupplierId,
    poReference,
    setPoReference,
    handleConvertPR,
  } = useConvertRequisitionModal(pr, isOpen, onSuccess);

  return (
    <AnimatePresence>
      {isOpen && pr && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white dark:bg-slate-800 w-full max-w-md rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden"
          >
            <div className="flex justify-between items-center p-8 border-b border-slate-50 dark:border-slate-700">
              <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2 uppercase tracking-tight">
                <FileSpreadsheet className="w-5 h-5 text-indigo-500" />
                Generate PO from Requisition
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <form onSubmit={handleConvertPR} className="p-8 space-y-5">
              <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 p-4 rounded-2xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-800 dark:text-amber-400 font-semibold leading-relaxed">
                  This will convert the approved items of {pr.prNumber} into a new Purchase Order.
                </p>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                  Supplier Entity
                </label>
                <select
                  required
                  value={selectedSupplierId}
                  onChange={(e) => setSelectedSupplierId(e.target.value)}
                  className="w-full px-5 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all font-bold text-xs"
                >
                  <option value="">Select Supplier</option>
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                  PO Reference Number
                </label>
                <input
                  type="text"
                  required
                  value={poReference}
                  onChange={(e) => setPoReference(e.target.value)}
                  className="w-full px-5 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all font-mono text-xs font-bold uppercase tracking-wider"
                />
              </div>

              <div className="pt-4 flex gap-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-black text-xs uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-[2] py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2"
                >
                  Generate PO
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
