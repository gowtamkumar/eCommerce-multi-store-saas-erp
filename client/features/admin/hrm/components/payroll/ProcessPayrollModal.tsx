'use client';

import { Dispatch, SetStateAction } from 'react';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import Modal from '@/components/shared/Modal';
import FormField, { fieldControlClass } from '@/components/shared/FormField';

interface ProcessPayrollData {
  period: string;
  name: string;
}

interface ProcessPayrollModalProps {
  open: boolean;
  onClose: () => void;
  processData: ProcessPayrollData;
  setProcessData: Dispatch<SetStateAction<ProcessPayrollData>>;
  processing: boolean;
  onSubmit: () => void;
}

export default function ProcessPayrollModal({
  open,
  onClose,
  processData,
  setProcessData,
  processing,
  onSubmit,
}: ProcessPayrollModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={<>Execute <span className="text-indigo-600">Cycle</span></>}
    >
      <div className="space-y-6">
        <FormField label="Pay Cycle Name">
          <input
            type="text"
            value={processData.name}
            onChange={(e) => setProcessData((prev) => ({ ...prev, name: e.target.value }))}
            className={fieldControlClass}
          />
        </FormField>
        <FormField label="Period (YYYY-MM)">
          <input
            type="month"
            value={processData.period}
            onChange={(e) => setProcessData((prev) => ({ ...prev, period: e.target.value }))}
            className={fieldControlClass}
          />
        </FormField>
        <div className="p-6 bg-indigo-50 dark:bg-indigo-900/20 rounded-3xl border border-indigo-100 dark:border-indigo-800/50 flex items-start gap-4">
          <AlertCircle className="w-5 h-5 text-indigo-600 mt-1" />
          <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 leading-relaxed italic">
            By confirming, the system will aggregate all active employee salaries, attendance deductions, and approved leaves for the selected period. This will also create accounting entries.
          </p>
        </div>
        <button onClick={onSubmit} disabled={processing} className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl flex items-center justify-center gap-2 disabled:opacity-50">
          {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
          Confirm & Process
        </button>
      </div>
    </Modal>
  );
}
