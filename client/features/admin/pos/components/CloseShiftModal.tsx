import { AnimatePresence, motion } from 'framer-motion';
import { X, Loader2, History, AlertCircle } from 'lucide-react';
import { useSettings } from '@/hooks/SettingsContext';
import { formatCurrency } from '@/lib/utils';
import type { PosShift } from '../type';
import { DENOMINATIONS } from '../utils/posHelpers';

interface CloseShiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeShift: PosShift;
  closingBalance: number | '';
  setClosingBalance: (bal: number | '') => void;
  closingRemarks: string;
  setClosingRemarks: (remarks: string) => void;
  showDenoCalc: boolean;
  setShowDenoCalc: (val: boolean) => void;
  denoCounts: Record<string, number>;
  setDenoCounts: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  submittingShift: boolean;
  handleCloseShift: (e: React.FormEvent) => void;
}

export default function CloseShiftModal({
  isOpen,
  onClose,
  activeShift,
  closingBalance,
  setClosingBalance,
  closingRemarks,
  setClosingRemarks,
  showDenoCalc,
  setShowDenoCalc,
  denoCounts,
  setDenoCounts,
  submittingShift,
  handleCloseShift,
}: CloseShiftModalProps) {
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
              <h3 className="text-lg font-black text-slate-900 dark:text-white">Audit & Close Till</h3>
              <button
                onClick={onClose}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleCloseShift}>
              <div className="p-6 space-y-5">
                {/* Stats list */}
                <div className="p-4 bg-slate-50 dark:bg-slate-955 rounded-2xl space-y-2">
                  <div className="flex justify-between text-xs text-slate-500 font-medium">
                    <span>Opening Base Cash</span>
                    <span className="font-bold text-slate-850 dark:text-white">
                      {formatCurrency(activeShift.openingBalance, currencySymbol)}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-500 font-medium">
                    <span>Cash Sales Collected</span>
                    <span className="font-bold text-emerald-500">
                      +{formatCurrency(activeShift.cashSales, currencySymbol)}
                    </span>
                  </div>
                  {Number(activeShift.cashIn || 0) > 0 && (
                    <div className="flex justify-between text-xs text-slate-500 font-medium">
                      <span>Cash In (Adjustments)</span>
                      <span className="font-bold text-emerald-500">
                        +{formatCurrency(activeShift.cashIn || 0, currencySymbol)}
                      </span>
                    </div>
                  )}
                  {Number(activeShift.cashOut || 0) > 0 && (
                    <div className="flex justify-between text-xs text-slate-500 font-medium">
                      <span>Cash Out (Adjustments)</span>
                      <span className="font-bold text-red-500">
                        -{formatCurrency(activeShift.cashOut || 0, currencySymbol)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-xs font-black text-slate-900 dark:text-white pt-2 border-t border-slate-100 dark:border-slate-850">
                    <span>Expected Drawer Cash</span>
                    <span className="text-brand-500 font-black">
                      {formatCurrency(activeShift.expectedClosingBalance, currencySymbol)}
                    </span>
                  </div>

                  {/* Non-Cash Aggregates */}
                  <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/60 space-y-1.5">
                    <div className="flex justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      <span>Non-Cash Sales (Info Only)</span>
                    </div>
                    <div className="flex justify-between text-xs text-slate-500 font-medium">
                      <span>Card Sales</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {formatCurrency(activeShift.cardSales || 0, currencySymbol)}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs text-slate-500 font-medium">
                      <span>Mobile Sales</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {formatCurrency(activeShift.mobileSales || 0, currencySymbol)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">
                      Audited Closing Cash
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowDenoCalc(!showDenoCalc)}
                      className="text-[9px] font-black text-brand-600 dark:text-brand-400 uppercase tracking-wider"
                    >
                      {showDenoCalc ? 'Close Calculator' : 'Use Calculator'}
                    </button>
                  </div>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={closingBalance}
                    readOnly={showDenoCalc}
                    onChange={(e) =>
                      setClosingBalance(e.target.value === '' ? '' : Number(e.target.value))
                    }
                    placeholder="0.00"
                    className={`w-full px-4 py-3 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none font-extrabold text-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500 transition-colors ${showDenoCalc ? 'bg-slate-50 dark:bg-slate-950 border-slate-100 dark:border-slate-850 cursor-not-allowed opacity-90' : 'bg-white dark:bg-slate-900'
                      }`}
                  />
                </div>

                {showDenoCalc && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-850 space-y-4 overflow-hidden"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                        Denomination Counter
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setDenoCounts({
                            '100': 0,
                            '50': 0,
                            '20': 0,
                            '10': 0,
                            '5': 0,
                            '1': 0,
                            '0.25': 0,
                            '0.10': 0,
                            '0.05': 0,
                            '0.01': 0,
                          });
                        }}
                        className="text-[9px] font-bold text-slate-450 hover:text-red-500 uppercase tracking-widest transition-colors"
                      >
                        Clear All
                      </button>
                    </div>

                    {/* Bills Section */}
                    <div className="space-y-2">
                      <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-200/40 dark:border-slate-800/40 pb-1">
                        Bills (Notes)
                      </span>
                      <div className="grid grid-cols-2 gap-2">
                        {DENOMINATIONS.filter((d) => d.type === 'bill').map((d) => (
                          <div key={d.value} className="flex items-center justify-between gap-2 bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200/50 dark:border-slate-800/50">
                            <span className="text-xs font-bold text-slate-655 dark:text-slate-350 min-w-[32px]">{d.label}</span>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] text-slate-400 font-semibold">×</span>
                              <input
                                type="number"
                                min="0"
                                value={denoCounts[String(d.value)] || 0}
                                onChange={(e) => {
                                  const val = e.target.value === '' ? 0 : Math.max(0, parseInt(e.target.value));
                                  setDenoCounts((prev) => ({
                                    ...prev,
                                    [String(d.value)]: val,
                                  }));
                                }}
                                className="w-12 px-1.5 py-1 text-center text-xs font-bold bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg outline-none focus:ring-1 focus:ring-red-500 text-slate-900 dark:text-white"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Coins Section */}
                    <div className="space-y-2">
                      <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-200/40 dark:border-slate-800/40 pb-1">
                        Coins
                      </span>
                      <div className="grid grid-cols-2 gap-2">
                        {DENOMINATIONS.filter((d) => d.type === 'coin').map((d) => (
                          <div key={d.value} className="flex items-center justify-between gap-2 bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200/50 dark:border-slate-800/50">
                            <span className="text-xs font-bold text-slate-655 dark:text-slate-350 min-w-[32px]">{d.label}</span>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] text-slate-400 font-semibold">×</span>
                              <input
                                type="number"
                                min="0"
                                value={denoCounts[String(d.value)] || 0}
                                onChange={(e) => {
                                  const val = e.target.value === '' ? 0 : Math.max(0, parseInt(e.target.value));
                                  setDenoCounts((prev) => ({
                                    ...prev,
                                    [String(d.value)]: val,
                                  }));
                                }}
                                className="w-12 px-1.5 py-1 text-center text-xs font-bold bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg outline-none focus:ring-1 focus:ring-red-500 text-slate-900 dark:text-white"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {closingBalance !== '' && (
                  <div className="flex justify-between items-center text-xs p-3 bg-red-500/10 rounded-xl border border-red-500/20">
                    <span className="font-bold text-slate-655 dark:text-slate-350 flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4 text-red-500 animate-bounce" /> Variance (Difference)
                    </span>
                    <span
                      className={`font-black ${Number(closingBalance) - activeShift.expectedClosingBalance === 0 ? 'text-emerald-500' : 'text-red-500'}`}
                    >
                      {formatCurrency(Number(closingBalance) - activeShift.expectedClosingBalance, currencySymbol)}
                    </span>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">
                    Shift remarks
                  </label>
                  <textarea
                    placeholder="Audit details, cash discrepancies reasons..."
                    value={closingRemarks}
                    onChange={(e) => setClosingRemarks(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl outline-none text-xs text-slate-900 dark:text-white h-20 resize-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>

              <div className="p-6 bg-slate-50 dark:bg-slate-955 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 text-xs font-bold text-slate-500 hover:bg-white dark:hover:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingShift}
                  className="px-6 py-2.5 bg-red-650 hover:bg-red-750 text-white font-black rounded-xl shadow-lg flex items-center gap-2"
                >
                  {submittingShift ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <History className="w-4 h-4" />
                  )}
                  Complete Audit & Close
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
