"use client";

import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeftRight, X } from "lucide-react";
import { CreateRfqModalProps } from "../types";
import { useCreateRfqModal } from "../hooks/useCreateRfqModal";

export default function CreateRfqModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateRfqModalProps) {
  const {
    deadlineDate,
    setDeadlineDate,
    prId,
    setPrId,
    requisitions,
    handleCreateRFQ,
  } = useCreateRfqModal(onSuccess, isOpen);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white dark:bg-slate-800 w-full max-w-md rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden"
          >
            <div className="flex justify-between items-center p-8 border-b border-slate-50 dark:border-slate-700">
              <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2 uppercase tracking-tight">
                <ArrowLeftRight className="w-5 h-5 text-indigo-500" />
                New Sourcing RFQ
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <form onSubmit={handleCreateRFQ} className="p-8 space-y-5">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                  Sourcing Deadline
                </label>
                <input
                  type="date"
                  required
                  value={deadlineDate}
                  onChange={(e) => setDeadlineDate(e.target.value)}
                  className="w-full px-5 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all font-bold text-xs"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                  Link Purchase Requisition (Optional)
                </label>
                <select
                  value={prId}
                  onChange={(e) => setPrId(e.target.value)}
                  className="w-full px-5 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all font-bold text-xs"
                >
                  <option value="">No Requisition Link</option>
                  {requisitions.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.prNumber} - {r.justification || "General"}
                    </option>
                  ))}
                </select>
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
                  className="flex-[2] py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg"
                >
                  Save RFQ Campaign
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
