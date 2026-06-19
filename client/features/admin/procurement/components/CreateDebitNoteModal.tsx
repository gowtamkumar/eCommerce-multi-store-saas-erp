'use client';

import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Receipt, X } from 'lucide-react';
import type { CreateDebitNoteModalProps } from '../types';
import { useCreateDebitNoteForm } from '../hooks/useCreateDebitNoteForm';
import DebitNoteDisputePanel from './DebitNoteDisputePanel';
import { buildDraftDebitNoteSummary } from '../lib/buildDebitNoteDisputeContext';

export default function CreateDebitNoteModal({
  isOpen,
  onClose,
  onSuccess
}: CreateDebitNoteModalProps) {
  const {
    selectedSupplierId,
    setSelectedSupplierId,
    selectedPoId,
    setSelectedPoId,
    amount,
    setAmount,
    reason,
    setReason,
    suppliers,
    purchaseOrders,
    loadingLists,
    submitting,
    handleCreateDebitNote,
  } = useCreateDebitNoteForm(onSuccess, onClose);

  const debitNoteSummary = useMemo(
    () =>
      buildDraftDebitNoteSummary(
        {
          supplierId: selectedSupplierId,
          purchaseOrderId: selectedPoId,
          amount,
          reason,
        },
        suppliers,
        purchaseOrders,
      ),
    [selectedSupplierId, selectedPoId, amount, reason, suppliers, purchaseOrders],
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white dark:bg-slate-800 w-full max-w-xl rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden"
          >
            <div className="flex justify-between items-center p-8 border-b border-slate-50 dark:border-slate-700">
              <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2 uppercase tracking-tight">
                <Receipt className="w-5 h-5 text-indigo-500" />
                New Debit Note
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
                type="button"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <form onSubmit={handleCreateDebitNote} className="p-8 space-y-5 max-h-[75vh] overflow-y-auto">
              <DebitNoteDisputePanel
                debitNoteSummary={debitNoteSummary}
                disabled={!selectedSupplierId || !amount}
                onApplyReason={setReason}
              />

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                  Supplier Entity
                </label>
                <select
                  required
                  value={selectedSupplierId}
                  onChange={(e) => setSelectedSupplierId(e.target.value)}
                  className="w-full px-5 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white outline-none font-bold text-xs"
                  disabled={loadingLists || submitting}
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
                  Purchase Order Reference
                </label>
                <select
                  required
                  value={selectedPoId}
                  onChange={(e) => setSelectedPoId(e.target.value)}
                  className="w-full px-5 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white outline-none font-bold text-xs"
                  disabled={loadingLists || submitting}
                >
                  <option value="">Select PO</option>
                  {(selectedSupplierId
                    ? purchaseOrders.filter((po) => (po.supplierId || po.supplier?.id) === selectedSupplierId)
                    : purchaseOrders
                  ).map((po) => (
                    <option key={po.id} value={po.id}>
                      {po.referenceNumber}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                  Adjustment Amount ($)
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-5 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white outline-none font-mono font-bold text-xs"
                  placeholder="e.g. 150"
                  disabled={submitting}
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                  Reason / Return Memo
                </label>
                <textarea
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-5 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white outline-none font-bold text-xs"
                  rows={3}
                  placeholder="Damaged stock on arrival / short shipment"
                  disabled={submitting}
                />
              </div>

              <div className="pt-4 flex gap-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-black text-xs uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-[2] py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg flex items-center justify-center gap-2"
                  disabled={submitting}
                >
                  {submitting ? 'Generating...' : 'Generate Debit Note'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
