'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { BookOpen, Loader2, Printer, ShieldCheck, User, X } from 'lucide-react';
import { useState } from 'react';
import { PayrollBatch, PayrollSlip } from '../../hooks/usePayrollManager';
import PayslipExplanationModal from './PayslipExplanationModal';
import {
  formatPayrollStatus,
  getPaymentActionLabel,
  getPayrollStatusClassName,
} from './payrollUi';
import { useSettings } from '@/hooks/SettingsContext';
import { formatCurrency } from '@/lib/utils';

interface PayrollSlipsDrawerProps {
  selectedBatch: PayrollBatch | null;
  slips: PayrollSlip[];
  loadingSlips: boolean;
  processing: boolean;
  onClose: () => void;
  onApprove: (batch: PayrollBatch) => void;
  onPayBatch: () => void;
}

export default function PayrollSlipsDrawer({
  selectedBatch,
  slips,
  loadingSlips,
  processing,
  onClose,
  onApprove,
  onPayBatch,
}: PayrollSlipsDrawerProps) {
  const [explainingSlip, setExplainingSlip] = useState<PayrollSlip | null>(null);

  return (
    <>
      <AnimatePresence>
        {selectedBatch && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-3xl bg-white dark:bg-slate-900 shadow-2xl h-full flex flex-col"
            >
              <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight italic leading-none">{selectedBatch.name}</h2>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Individual Compensation Slips</p>
                </div>
                <button onClick={onClose} className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl hover:bg-rose-50 hover:text-rose-600 transition-all">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-4">
                {loadingSlips ? (
                  <div className="flex flex-col items-center justify-center h-full gap-4">
                    <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
                    <p className="text-xs font-black uppercase tracking-widest text-slate-400 italic">Assembling Slips...</p>
                  </div>
                ) : slips.map((slip) => (
                  <PayrollSlipCard
                    key={slip.id}
                    slip={slip}
                    onExplain={() => setExplainingSlip(slip)}
                  />
                ))}
              </div>

              <div className="p-8 border-t border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col gap-3">
                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-500">
                  <span>Status</span>
                  <span className={`px-3 py-1 rounded-lg ${getPayrollStatusClassName(selectedBatch.status)}`}>
                    {formatPayrollStatus(selectedBatch.status)}
                  </span>
                </div>
                <div className="flex gap-4">
                  {selectedBatch.status === 'PENDING_APPROVAL' && (
                    <button onClick={() => onApprove(selectedBatch)} className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl flex items-center justify-center gap-2">
                      <ShieldCheck className="w-4 h-4" />
                      Approve Batch
                    </button>
                  )}
                  <button
                    onClick={onPayBatch}
                    disabled={processing || selectedBatch.status !== 'APPROVED'}
                    className="flex-1 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-xl disabled:opacity-50"
                  >
                    {getPaymentActionLabel(selectedBatch, processing)}
                  </button>
                  <button className="px-8 py-4 bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-slate-100 dark:border-slate-700 hover:text-indigo-600 transition-all">
                    Export PDF
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {selectedBatch && explainingSlip && (
        <PayslipExplanationModal
          batch={selectedBatch}
          slip={explainingSlip}
          onClose={() => setExplainingSlip(null)}
        />
      )}
    </>
  );
}

function PayrollSlipCard({
  slip,
  onExplain,
}: {
  slip: PayrollSlip;
  onExplain: () => void;
}) {
  const { selectedCurrency } = useSettings();
  const currencySymbol = selectedCurrency?.symbol || '$';

  return (
    <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-700 flex items-center justify-between group">
      <div className="flex items-center gap-6">
        <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-700 flex items-center justify-center text-slate-400 group-hover:text-indigo-600 transition-all shadow-sm">
          <User className="w-6 h-6" />
        </div>
        <div>
          <p className="font-black text-slate-900 dark:text-white uppercase tracking-tight text-sm">{slip.employee?.user?.name}</p>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{slip.employee?.designation?.name}</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Net Pay</p>
          <p className="text-base font-black text-indigo-600 dark:text-indigo-400">{formatCurrency(slip.netSalary, currencySymbol)}</p>
        </div>
        <button
          type="button"
          onClick={onExplain}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest bg-indigo-600 hover:bg-indigo-700 text-white transition-all"
          title="Draft employee payslip explanation"
        >
          <BookOpen className="w-3.5 h-3.5" />
          Explain
        </button>
        <button className="p-3 text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all">
          <Printer className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
