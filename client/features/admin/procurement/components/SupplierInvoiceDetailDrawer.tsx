'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  CheckCircle,
  AlertTriangle,
  CreditCard
} from 'lucide-react';
import type { SupplierInvoiceDetailDrawerProps } from '../types';
import { useSettings } from '@/hooks/SettingsContext';
import { formatCurrency } from '@/lib/utils';

export default function SupplierInvoiceDetailDrawer({
  invoice,
  onClose,
  onOpenPayModal,
}: SupplierInvoiceDetailDrawerProps) {
  const { selectedCurrency } = useSettings();
  const currencySymbol = selectedCurrency?.symbol || '$';
  return (
    <AnimatePresence>
      {invoice && (
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
                  {invoice.invoiceNumber}
                </span>
                <span className="px-2.5 py-1 bg-slate-100 rounded-lg text-[9px] font-black uppercase text-slate-600">
                  {invoice.status}
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
                  {invoice.supplier?.name || 'Supplier Invoice'}
                </h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                  Related PO: {invoice.purchaseOrder?.referenceNumber || 'Unlinked'}
                </p>
              </div>

              {/* Match Status Card */}
              <div className={`p-5 rounded-3xl border flex items-start gap-4 ${
                invoice.matchStatus === 'MATCHED'
                  ? 'border-emerald-200 bg-emerald-50/10'
                  : 'border-rose-200 bg-rose-50/10'
              }`}>
                {invoice.matchStatus === 'MATCHED' ? (
                  <>
                    <CheckCircle className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-black text-slate-950 uppercase tracking-widest">3-Way Match Passed</h4>
                      <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                        Invoice prices and quantities match the original Purchase Order and actual warehouse GRN intake perfectly.
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-black text-slate-955 uppercase tracking-widest">3-Way Match Discrepancy</h4>
                      <p className="text-[11px] text-rose-600 font-semibold mt-2 leading-relaxed whitespace-pre-line">
                        {invoice.discrepancyNotes || 'Quantities or unit prices mismatch PO or Goods Received Note receipts.'}
                      </p>
                    </div>
                  </>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 p-5 bg-slate-50 dark:bg-slate-900 rounded-3xl">
                <div>
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Total Bill Amount</span>
                  <span className="text-base font-black text-slate-900 dark:text-white font-mono">{formatCurrency(invoice.totalAmount, currencySymbol)}</span>
                </div>
                <div>
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Due Date</span>
                  <span className="text-sm font-black text-slate-900 dark:text-white">
                    {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </div>

              {/* Invoice Items */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Invoice Line Items</h4>
                <div className="space-y-2">
                  {invoice.items?.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl flex justify-between items-center"
                    >
                      <div className="text-xs font-black text-slate-900 dark:text-white">
                        {item.product?.name || 'Unknown Product'}
                      </div>
                      <div className="text-xs font-black text-slate-700 dark:text-slate-300 font-mono">
                        {item.quantity} x {formatCurrency(item.unitPrice, currencySymbol)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            {invoice.status !== 'PAID' && (
              <div className="pt-6 border-t border-slate-100 dark:border-slate-700 shrink-0">
                <button
                  onClick={onOpenPayModal}
                  className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
                >
                  <CreditCard className="w-4 h-4" /> Record Payment
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
