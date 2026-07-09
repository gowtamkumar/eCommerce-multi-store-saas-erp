import { Coins, Banknote, Loader2 } from 'lucide-react';
import { useSettings } from '@/hooks/SettingsContext';
import type { Register } from '../type';

interface OpenTillScreenProps {
  registers: Register[];
  selectedRegisterId: string;
  setSelectedRegisterId: (id: string) => void;
  openingBalance: number | '';
  setOpeningBalance: (bal: number | '') => void;
  submittingShift: boolean;
  handleOpenShift: (e: React.FormEvent) => void;
}

export default function OpenTillScreen({
  registers,
  selectedRegisterId,
  setSelectedRegisterId,
  openingBalance,
  setOpeningBalance,
  submittingShift,
  handleOpenShift,
}: OpenTillScreenProps) {
  const { selectedCurrency } = useSettings();
  const currencySymbol = selectedCurrency?.symbol || '$';

  return (
    <div className="max-w-md mx-auto my-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-2xl p-8">
      <div className="flex flex-col items-center gap-3 text-center mb-8">
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-full">
          <Coins className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white">Open Counter Till</h2>
        <p className="text-xs text-slate-500 font-medium max-w-[280px]">
          Please sign in to a physical register terminal and state your opening cash balance to log shifts.
        </p>
      </div>

      <form onSubmit={handleOpenShift} className="space-y-6">
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Select Terminal Register</label>
          <select
            value={selectedRegisterId}
            onChange={(e) => setSelectedRegisterId(e.target.value)}
            className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-bold text-sm"
          >
            {registers.length === 0 ? (
              <option value="">No Register Terminals Available</option>
            ) : (
              registers.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} - Scoped Branch ID: {r.branchId?.substring(0, 8)}...
                </option>
              ))
            )}
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Opening Till Balance</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-lg text-slate-400">{currencySymbol}</span>
            <input
              type="number"
              min="0"
              required
              value={openingBalance}
              onChange={(e) => setOpeningBalance(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="0.00"
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-extrabold text-lg outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={submittingShift || registers.length === 0}
          className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl shadow-xl shadow-emerald-600/10 hover:shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submittingShift ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Banknote className="w-5 h-5" />
          )}
          Audit Cash & Open Shift
        </button>
      </form>
    </div>
  );
}
