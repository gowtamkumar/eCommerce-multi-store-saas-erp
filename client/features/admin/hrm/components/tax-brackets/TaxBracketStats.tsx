import { Calculator, Receipt, TrendingUp } from 'lucide-react';

interface TaxBracketStatsProps {
  fiscalYear: number;
  setFiscalYear: (year: number) => void;
  bracketCount: number;
  effectiveRate: number;
}

export default function TaxBracketStats({
  fiscalYear,
  setFiscalYear,
  bracketCount,
  effectiveRate,
}: TaxBracketStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 shadow-sm flex items-center gap-6">
        <div className="w-16 h-16 rounded-3xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600">
          <Receipt className="w-8 h-8" />
        </div>
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Fiscal Year</p>
          <input
            type="number"
            value={fiscalYear}
            onChange={(e) => setFiscalYear(Number(e.target.value) || new Date().getFullYear())}
            className="w-32 bg-transparent text-3xl font-black text-slate-900 dark:text-white outline-none"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 shadow-sm flex items-center gap-6">
        <div className="w-16 h-16 rounded-3xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600">
          <Calculator className="w-8 h-8" />
        </div>
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Brackets</p>
          <h3 className="text-3xl font-black text-slate-900 dark:text-white">{bracketCount}</h3>
        </div>
      </div>

      <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white flex items-center gap-6 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/20 blur-[60px] rounded-full" />
        <div className="w-16 h-16 rounded-3xl bg-white/10 flex items-center justify-center text-indigo-400 relative z-10">
          <TrendingUp className="w-8 h-8" />
        </div>
        <div className="relative z-10">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Avg Rate</p>
          <h3 className="text-3xl font-black">{(effectiveRate * 100).toFixed(2)}%</h3>
        </div>
      </div>
    </div>
  );
}
