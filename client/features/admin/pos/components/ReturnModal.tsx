import { AnimatePresence, motion } from 'framer-motion';
import { X, Search, Loader2, RefreshCw, Minus, Plus, History } from 'lucide-react';
import { useSettings } from '@/hooks/SettingsContext';
import { formatCurrency } from '@/lib/utils';
import type { ReturnOrder } from '../type';

interface ReturnModalProps {
  isOpen: boolean;
  onClose: () => void;
  returnOrderId: string;
  setReturnOrderId: (id: string) => void;
  searchingOrder: boolean;
  returnOrder: ReturnOrder | null;
  returnQuantities: Record<string, number>;
  setReturnQuantities: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  returnReason: string;
  setReturnReason: (reason: string) => void;
  submittingReturn: boolean;
  handleSearchReturnOrder: () => void;
  handleSubmitPOSReturn: (isExchange: boolean) => void;
}

export default function ReturnModal({
  isOpen,
  onClose,
  returnOrderId,
  setReturnOrderId,
  searchingOrder,
  returnOrder,
  returnQuantities,
  setReturnQuantities,
  returnReason,
  setReturnReason,
  submittingReturn,
  handleSearchReturnOrder,
  handleSubmitPOSReturn,
}: ReturnModalProps) {
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
            className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col h-[80vh]"
          >
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <RefreshCw className="w-5 h-5 text-brand-500" />
                  Process POS Return & Exchange
                </h3>
                <p className="text-xs text-slate-400 font-medium">Issue customer store credit or perform straight exchanges at the counter</p>
              </div>
              <button
                onClick={onClose}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-805 rounded-lg"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Search Order Section */}
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Enter Order ID or Invoice Code..."
                    value={returnOrderId}
                    onChange={(e) => setReturnOrderId(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-855 bg-white dark:bg-slate-950 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-500 transition-all font-bold text-sm shadow-sm"
                  />
                </div>
                <button
                  onClick={handleSearchReturnOrder}
                  disabled={searchingOrder}
                  className="px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white font-black text-sm rounded-2xl transition-all shadow-md hover:shadow-lg flex items-center gap-2 disabled:opacity-50"
                >
                  {searchingOrder ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'Search Order'
                  )}
                </button>
              </div>

              {returnOrder ? (
                <div className="space-y-6">
                  {/* Order summary info */}
                  <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 dark:bg-slate-955 rounded-2xl border border-slate-105 dark:border-slate-850">
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Customer Reference</p>
                      <p className="text-sm font-black text-slate-850 dark:text-white">{returnOrder.customerName || returnOrder.user?.username || 'Guest Customer'}</p>
                      <p className="text-xs text-slate-400 font-medium">{returnOrder.customerPhone || 'No phone set'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Order Value & Date</p>
                      <p className="text-sm font-black text-brand-500">{formatCurrency(returnOrder.totalAmount, currencySymbol)}</p>
                      <p className="text-xs text-slate-400 font-medium">{new Date(returnOrder.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>

                  {/* Order items lists */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">Order Items (Select return quantities)</h4>
                    <div className="space-y-2">
                      {returnOrder.items.map((item) => {
                        let alreadyReturned = 0;
                        if (returnOrder.returns) {
                          for (const ret of returnOrder.returns) {
                            if (ret.status !== 'rejected') {
                              for (const retItem of ret.items) {
                                if (
                                  retItem.productId === item.productId &&
                                  (retItem.variantId === item.variantId || (!retItem.variantId && !item.variantId))
                                ) {
                                  alreadyReturned += Number(retItem.quantity);
                                }
                              }
                            }
                          }
                        }
                        const maxQty = Math.max(0, item.quantity - alreadyReturned);
                        const currentQty = returnQuantities[item.id] || 0;
                        return (
                          <div key={item.id} className="flex items-center justify-between p-4 bg-white dark:bg-slate-955 rounded-2xl border border-slate-100 dark:border-slate-850 hover:border-slate-200 dark:hover:border-slate-800 transition-all shadow-sm">
                            <div>
                              <p className="text-sm font-black text-slate-900 dark:text-white">{item.product?.name || 'Product'}</p>
                              {item.variant && (
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                                  Variant: {Object.entries(item.variant.combination).map(([k, v]) => `${k}:${v}`).join(', ')}
                                </p>
                              )}
                              <p className="text-xs text-brand-500 font-bold mt-1">{formatCurrency(item.unitPrice, currencySymbol)} each</p>
                            </div>

                            <div className="flex items-center gap-3">
                              <button
                                type="button"
                                onClick={() => {
                                  setReturnQuantities((prev) => ({
                                    ...prev,
                                    [item.id]: Math.max(0, currentQty - 1),
                                  }));
                                }}
                                className="p-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-250 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg transition-all"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="text-sm font-black text-slate-900 dark:text-white w-6 text-center">
                                {currentQty} / {maxQty}
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  setReturnQuantities((prev) => ({
                                    ...prev,
                                    [item.id]: Math.min(maxQty, currentQty + 1),
                                  }));
                                }}
                                className="p-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-250 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg transition-all"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Return details inputs */}
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">Return Reason Remarks</label>
                    <input
                      type="text"
                      placeholder="Why is the customer returning these items?"
                      value={returnReason}
                      onChange={(e) => setReturnReason(e.target.value)}
                      className="w-full px-4 py-3 border border-slate-200 dark:border-slate-855 bg-white dark:bg-slate-950 rounded-2xl outline-none text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 transition-all font-bold"
                    />
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                  <History className="w-12 h-12 mb-3 text-slate-350 dark:text-slate-750" />
                  <p className="text-xs font-bold uppercase tracking-wider">No order selected</p>
                  <p className="text-xs text-slate-400 mt-1">Search for an order above using ID or receipt invoice reference.</p>
                </div>
              )}
            </div>

            {returnOrder && (
              <div className="p-6 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <div className="flex flex-col gap-3">
                  <span className="text-xs font-bold text-slate-400">
                    Refund Total:{' '}
                    <span className="text-brand-500 font-black text-sm">
                      {formatCurrency(
                        Object.entries(returnQuantities).reduce((total, [itemId, qty]) => {
                          const orderItem = returnOrder.items.find((item) => item.id === itemId);
                          const netUnit = orderItem
                            ? Number(orderItem.unitPrice) - Number(orderItem.discountAmount || 0)
                            : 0;
                          return total + netUnit * qty;
                        }, 0),
                        currencySymbol
                      )}
                    </span>
                  </span>
                  <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4 text-[11px] text-slate-600 dark:text-slate-300 space-y-2">
                    <p className="font-semibold text-slate-900 dark:text-white">Return action guidance</p>
                    <p>Straight Return & Refund: complete a normal return and issue the refund for the returned items.</p>
                    <p>Process Return & Start Exchange: process the return, then ring up replacement items as a new sale. For walk-in customers without an account, refund via CASH or CARD.</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    disabled={submittingReturn}
                    onClick={() => handleSubmitPOSReturn(false)}
                    className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-white font-black text-xs rounded-2xl transition-all shadow-md disabled:opacity-50"
                  >
                    Straight Return & Refund
                  </button>
                  <button
                    type="button"
                    disabled={submittingReturn}
                    onClick={() => handleSubmitPOSReturn(true)}
                    className="px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white font-black text-xs rounded-2xl transition-all shadow-md hover:shadow-lg flex items-center gap-1.5 disabled:opacity-50"
                  >
                    Process Return & Start Exchange
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
