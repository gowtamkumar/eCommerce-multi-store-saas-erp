import { TrendingUp } from 'lucide-react';
import { PayrollBatch } from '../../hooks/usePayrollManager';
import { getPayrollStatusCounts } from './payrollUi';

interface PayrollInsightsProps {
  batches: PayrollBatch[];
  totalCompensated: number;
}

export default function PayrollInsights({ batches, totalCompensated }: PayrollInsightsProps) {
  return (
    <div className="lg:col-span-4 space-y-6">
      <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/30 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />
        <TrendingUp className="w-10 h-10 text-indigo-400 mb-8" />
        <h4 className="text-3xl font-black italic uppercase tracking-tighter leading-none mb-4">Total <br />Compensated</h4>
        <p className="text-5xl font-black text-indigo-400 mb-8">${totalCompensated.toLocaleString()}</p>
        <div className="space-y-4 pt-8 border-t border-white/10">
          {getPayrollStatusCounts(batches).map(({ label, count, color }) => (
            <div key={label} className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
              <span>{label}</span>
              <span className={color}>{count}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="p-8 bg-indigo-50 dark:bg-indigo-900/20 rounded-[2.5rem] border border-indigo-100 dark:border-indigo-800/50">
        <h5 className="text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-4">Pro Tip</h5>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-bold leading-relaxed italic">
          &ldquo;Payroll processing automatically generates General Ledger entries in the Finance module for salary expenses and liabilities.&rdquo;
        </p>
      </div>
    </div>
  );
}
