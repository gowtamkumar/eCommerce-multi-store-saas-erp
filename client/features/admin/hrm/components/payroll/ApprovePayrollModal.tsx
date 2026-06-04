'use client';

import { ShieldCheck, Loader2 } from 'lucide-react';
import Modal from '@/components/shared/Modal';
import FormField, { fieldControlClass } from '@/components/shared/FormField';
import { PayrollBatch, PayrollEmployee } from '../../hooks/usePayrollManager';

interface ApprovePayrollModalProps {
  batch: PayrollBatch | null;
  onClose: () => void;
  employees: PayrollEmployee[];
  approvedById: string;
  setApprovedById: (value: string) => void;
  processing: boolean;
  onSubmit: () => void;
}

export default function ApprovePayrollModal({
  batch,
  onClose,
  employees,
  approvedById,
  setApprovedById,
  processing,
  onSubmit,
}: ApprovePayrollModalProps) {
  return (
    <Modal
      open={!!batch}
      onClose={onClose}
      title={<>Approve <span className="text-blue-600">Batch</span></>}
    >
      {batch && (
        <>
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-8">{batch.name} - {batch.period}</p>
          <div className="space-y-6">
            <FormField label="Approving Manager">
              <select value={approvedById} onChange={(e) => setApprovedById(e.target.value)} className={fieldControlClass}>
                <option value="">Select Approver...</option>
                {employees.map((e) => (
                  <option key={e.id} value={e.id}>{e.user?.name}</option>
                ))}
              </select>
            </FormField>
            <div className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-3xl border border-blue-100 dark:border-blue-800/50 flex items-start gap-4">
              <ShieldCheck className="w-5 h-5 text-blue-600 mt-1" />
              <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 leading-relaxed italic">
                Approving will lock this batch, post salary accrual entries to the General Ledger, and unlock the &ldquo;Release Payment&rdquo; action.
              </p>
            </div>
            <button onClick={onSubmit} disabled={processing || !approvedById} className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl flex items-center justify-center gap-2 disabled:opacity-50">
              {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
              Confirm Approval
            </button>
          </div>
        </>
      )}
    </Modal>
  );
}
