'use client';

import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  CheckCircle,
  Check
} from 'lucide-react';
import type { DebitNoteDetailDrawerProps } from '../types';
import DebitNoteDisputePanel from './DebitNoteDisputePanel';
import { buildDebitNoteSummary } from '../lib/buildDebitNoteDisputeContext';

export default function DebitNoteDetailDrawer({
  note,
  onClose,
  onApprove,
}: DebitNoteDetailDrawerProps) {
  const debitNoteSummary = useMemo(
    () => (note ? buildDebitNoteSummary(note) : ''),
    [note],
  );

  return (
    <AnimatePresence>
      {note && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-900/40 backdrop-blur-sm">
          <motion.div
            initial={{ x: 350, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 350, opacity: 0 }}
            className="bg-white dark:bg-slate-800 w-full max-w-lg h-full shadow-2xl flex flex-col border-l border-slate-100 dark:border-slate-700 p-8"
          >
            <div className="flex justify-between items-center mb-8 shrink-0">
              <div className="flex items-center gap-3">
                <span className="text-xs font-black text-indigo-500 uppercase tracking-widest bg-indigo-50 dark:bg-indigo-900/20 px-3 py-1.5 rounded-lg">
                  {note.debitNoteNumber}
                </span>
                <span className="px-2.5 py-1 bg-slate-100 rounded-lg text-[9px] font-black uppercase text-slate-600">
                  {note.status}
                </span>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="flex-1 space-y-6 overflow-y-auto pr-1">
              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                  {note.supplier?.name || 'Debit Note'}
                </h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                  Related PO: {note.purchaseOrder?.referenceNumber || 'Unlinked'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 p-5 bg-slate-50 dark:bg-slate-900 rounded-3xl">
                <div>
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Adjustment Value</span>
                  <span className="text-base font-black text-indigo-600 font-mono">${note.amount}</span>
                </div>
                <div>
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Issue Date</span>
                  <span className="text-sm font-black text-slate-900 dark:text-white">
                    {note.createdAt ? new Date(note.createdAt).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Reason / Memo</h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900 p-5 rounded-2xl leading-relaxed font-semibold">
                  {note.reason}
                </p>
              </div>

              <DebitNoteDisputePanel debitNoteSummary={debitNoteSummary} />

              {note.status === 'APPROVED' && (
                <div className="p-4 bg-emerald-50/10 border border-emerald-200 rounded-2xl flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-xs font-black text-slate-900 uppercase">Posted to General Ledger</h5>
                    <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
                      Accounts Payable (2100) Liability debited, Inventory Asset (1100) credited. Supplier AP ledger has been adjusted.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            {note.status === 'DRAFT' && (
              <div className="pt-6 border-t border-slate-100 dark:border-slate-700 shrink-0">
                <button
                  onClick={() => onApprove(note.id)}
                  className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" /> Approve & Post to Accounts
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
