'use client';

import { Banknote, Calendar, ChevronRight, Loader2, ShieldCheck } from 'lucide-react';
import { PayrollBatch } from '../../hooks/usePayrollManager';
import { formatPayrollStatus, getPayrollStatusClassName } from './payrollUi';

interface PayrollHistoryProps {
  loading: boolean;
  batches: PayrollBatch[];
  onViewSlips: (batch: PayrollBatch) => void;
  onApprove: (batch: PayrollBatch) => void;
}

export default function PayrollHistory({
  loading,
  batches,
  onViewSlips,
  onApprove,
}: PayrollHistoryProps) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden">
      <div className="p-8 border-b border-slate-50 dark:border-slate-700 flex justify-between items-center">
        <h2 className="text-xs font-black uppercase tracking-widest text-slate-400">Payment History</h2>
        <div className="px-4 py-2 bg-slate-50 dark:bg-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500">2026 CY</div>
      </div>
      <div className="divide-y divide-slate-50 dark:divide-slate-700/50">
        {loading ? (
          <div className="p-20 text-center">
            <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mx-auto" />
          </div>
        ) : batches.length === 0 ? (
          <div className="p-20 text-center opacity-40">
            <Banknote className="w-16 h-16 text-slate-200 mx-auto mb-4" />
            <p className="text-sm font-bold uppercase tracking-widest italic">No payroll cycles processed yet</p>
          </div>
        ) : batches.map((batch) => (
          <PayrollHistoryRow
            key={batch.id}
            batch={batch}
            onViewSlips={onViewSlips}
            onApprove={onApprove}
          />
        ))}
      </div>
    </div>
  );
}

interface PayrollHistoryRowProps {
  batch: PayrollBatch;
  onViewSlips: (batch: PayrollBatch) => void;
  onApprove: (batch: PayrollBatch) => void;
}

function PayrollHistoryRow({ batch, onViewSlips, onApprove }: PayrollHistoryRowProps) {
  return (
    <div
      className="group p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:bg-slate-50/50 dark:hover:bg-slate-700/20 transition-all cursor-pointer"
      onClick={() => onViewSlips(batch)}
    >
      <div className="flex items-center gap-6">
        <div className="w-16 h-16 rounded-3xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-all">
          <Calendar className="w-7 h-7" />
        </div>
        <div>
          <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight italic leading-none mb-1">{batch.name}</h3>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{batch.period} • {new Date(batch.createdAt).toLocaleDateString()}</p>
        </div>
      </div>
      <div className="flex items-center gap-12 ml-auto">
        <div className="text-right">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Disbursement</p>
          <p className="text-lg font-black text-slate-900 dark:text-white">${Number(batch.totalAmount).toLocaleString()}</p>
        </div>
        <div className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest ${getPayrollStatusClassName(batch.status)}`}>
          {formatPayrollStatus(batch.status)}
        </div>
        {batch.status === 'PENDING_APPROVAL' && (
          <button
            onClick={(e) => { e.stopPropagation(); onApprove(batch); }}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 flex items-center gap-2"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Approve
          </button>
        )}
        <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-600 transition-all" />
      </div>
    </div>
  );
}
