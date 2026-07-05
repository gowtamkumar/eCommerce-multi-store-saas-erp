import { AnimatePresence, motion } from 'framer-motion';
import { X, DollarSign, Loader2, Coins } from 'lucide-react';
import { useSettings } from '@/hooks/SettingsContext';

interface DrawerTxModalProps {
  isOpen: boolean;
  onClose: () => void;
  drawerTxType: 'CASH_IN' | 'CASH_OUT';
  setDrawerTxType: (type: 'CASH_IN' | 'CASH_OUT') => void;
  drawerAmount: number | '';
  setDrawerAmount: (amount: number | '') => void;
  drawerReason: string;
  setDrawerReason: (reason: string) => void;
  submittingDrawerTx: boolean;
  handleDrawerTxSubmit: (e: React.FormEvent) => void;
}

export default function DrawerTxModal({
  isOpen,
  onClose,
  drawerTxType,
  setDrawerTxType,
  drawerAmount,
  setDrawerAmount,
  drawerReason,
  setDrawerReason,
  submittingDrawerTx,
  handleDrawerTxSubmit,
}: DrawerTxModalProps) {
  const { selectedCurrency } = useSettings();
  const currencySymbol = selectedCurrency?.symbol || '$';

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col"
          >
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">Cash Drawer Adjustment</h3>
              <button
                onClick={onClose}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleDrawerTxSubmit}>
              <div className="p-6 space-y-5">
                <div className="space-y-2">
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">
                    Transaction Type
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setDrawerTxType('CASH_IN')}
                      className={`py-3 rounded-2xl border text-center font-bold text-sm transition-all ${drawerTxType === 'CASH_IN'
                        ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-600/10'
                        : 'border-slate-250 dark:border-slate-800 text-slate-655 dark:text-slate-400'
                        }`}
                    >
                      Cash In (Add float)
                    </button>
                    <button
                      type="button"
                      onClick={() => setDrawerTxType('CASH_OUT')}
                      className={`py-3 rounded-2xl border text-center font-bold text-sm transition-all ${drawerTxType === 'CASH_OUT'
                        ? 'bg-red-650 border-red-650 text-white shadow-lg shadow-red-650/10'
                        : 'border-slate-250 dark:border-slate-800 text-slate-655 dark:text-slate-400'
                        }`}
                    >
                      Cash Out (Withdrawal)
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">
                    Amount ({currencySymbol})
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-450" />
                    <input
                      type="number"
                      required
                      min="0.01"
                      step="0.01"
                      value={drawerAmount}
                      onChange={(e) =>
                        setDrawerAmount(e.target.value === '' ? '' : Number(e.target.value))
                      }
                      placeholder="0.00"
                      className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-extrabold text-lg outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">
                    Reason / Description
                  </label>
                  <textarea
                    required
                    placeholder="Specify transaction reason (e.g. daily float top-up, supplier payout...)"
                    value={drawerReason}
                    onChange={(e) => setDrawerReason(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl outline-none text-xs text-slate-900 dark:text-white h-20 resize-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="p-6 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 text-xs font-bold text-slate-500 hover:bg-white dark:hover:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingDrawerTx}
                  className="px-6 py-2.5 bg-slate-900 hover:bg-slate-850 dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 text-white font-black rounded-xl shadow-lg flex items-center gap-2"
                >
                  {submittingDrawerTx ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Coins className="w-4 h-4" />
                  )}
                  Submit Transaction
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
