import { AnimatePresence, motion } from 'framer-motion';
import { Banknote, Coins, CreditCard, Loader2, QrCode, Wallet, X } from 'lucide-react';
import { useSettings } from '@/hooks/SettingsContext';
import { formatCurrency } from '@/lib/utils';
import type { CheckoutModalProps } from '../type';
import { DELIVERY_ZONES } from '../utils/posHelpers';



export default function CheckoutModal({
  isOpen,
  onClose,
  paymentMethod,
  setPaymentMethod,
  amountTendered,
  setAmountTendered,
  processingPayment,
  handleConfirmCheckout,
  splitPayment,
  setSplitPayment,
  splitPayments,
  setSplitPayments,
  selectedCustomer,
  walletBalance,
  outstandingBalance,
  useWalletBalance,
  setUseWalletBalance,
  walletAmountToUse,
  setWalletAmountToUse,
  handleWalletSelect,
  deliveryZone,
  setDeliveryZone,
  shippingAddress,
  setShippingAddress,
  grandTotal,
  changeDue,
  getSplitPaymentsSum,
  getRemainingPayableAmount,
  taxName,
  taxRate,
  taxableAmount,
  tax,
  shippingFee,
}: CheckoutModalProps) {
  const { selectedCurrency } = useSettings();
  const currencySymbol = selectedCurrency?.symbol || '$';

  const remainingAmount = getRemainingPayableAmount();
  const splitSum = getSplitPaymentsSum();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col"
          >
            <div className="p-6 border-b border-slate-100 dark:border-slate-850 flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">Collect Payment</h3>
              <button
                onClick={onClose}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-805 rounded-lg"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              {/* Method selector */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">
                    Payment Method
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer text-[10px] font-black uppercase tracking-wider text-slate-500">
                    <input
                      type="checkbox"
                      checked={splitPayment}
                      onChange={(e) => {
                        setSplitPayment(e.target.checked);
                        setSplitPayments({
                          cash: '',
                          card: '',
                          mobile: '',
                          on_account: '',
                        });
                      }}
                      className="rounded border-slate-350 text-brand-600 focus:ring-brand-500 h-3 w-3"
                    />
                    Split Payment
                  </label>
                </div>

                {!splitPayment ? (
                  <div className="grid grid-cols-5 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('cash')}
                      className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border gap-1 transition-all font-bold text-[10px] ${paymentMethod === 'cash'
                        ? 'bg-slate-900 border-slate-900 text-white dark:bg-white dark:border-white dark:text-slate-900 shadow-md'
                        : 'border-slate-200 dark:border-slate-850 hover:border-slate-400 text-slate-655'
                        }`}
                    >
                      <Banknote className="w-3.5 h-3.5" /> Cash
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('card')}
                      className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border gap-1 transition-all font-bold text-[10px] ${paymentMethod === 'card'
                        ? 'bg-slate-900 border-slate-900 text-white dark:bg-white dark:border-white dark:text-slate-900 shadow-md'
                        : 'border-slate-200 dark:border-slate-850 hover:border-slate-400 text-slate-655'
                        }`}
                    >
                      <CreditCard className="w-3.5 h-3.5" /> Card
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('mobile')}
                      className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border gap-1 transition-all font-bold text-[10px] ${paymentMethod === 'mobile'
                        ? 'bg-slate-900 border-slate-900 text-white dark:bg-white dark:border-white dark:text-slate-900 shadow-md'
                        : 'border-slate-200 dark:border-slate-850 hover:border-slate-400 text-slate-655'
                        }`}
                    >
                      <QrCode className="w-3.5 h-3.5" /> Mobile
                    </button>
                    <button
                      type="button"
                      disabled={!selectedCustomer}
                      onClick={() => setPaymentMethod('on_account')}
                      className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border gap-1 transition-all font-bold text-[10px] ${paymentMethod === 'on_account'
                        ? 'bg-slate-900 border-slate-900 text-white dark:bg-white dark:border-white dark:text-slate-900 shadow-md'
                        : 'border-slate-200 dark:border-slate-850 hover:border-slate-400 text-slate-655'
                        } disabled:opacity-40 disabled:cursor-not-allowed`}
                    >
                      <Coins className="w-3.5 h-3.5" /> Account
                    </button>
                    <button
                      type="button"
                      disabled={!selectedCustomer}
                      onClick={() => {
                        if (selectedCustomer) {
                          handleWalletSelect(selectedCustomer);
                        }
                      }}
                      className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border gap-1 transition-all font-bold text-[10px] ${paymentMethod === 'wallet'
                        ? 'bg-violet-600 border-violet-600 text-white shadow-md'
                        : 'border-slate-200 dark:border-slate-850 hover:border-violet-400 text-slate-655'
                        } disabled:opacity-40 disabled:cursor-not-allowed`}
                    >
                      <Wallet className="w-3.5 h-3.5" /> Wallet
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2 p-3 bg-slate-50/50 dark:bg-slate-950/50 rounded-2xl border border-slate-100 dark:border-slate-850">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[11px] font-bold text-slate-655 flex items-center gap-1">
                        <Banknote className="w-3.5 h-3.5 text-slate-400" /> Cash ({currencySymbol})
                      </span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        value={splitPayments.cash}
                        onChange={(e) =>
                          setSplitPayments((prev) => ({
                            ...prev,
                            cash: e.target.value === '' ? '' : Number(e.target.value),
                          }))
                        }
                        className="w-24 text-right px-2.5 py-1 border border-slate-250 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl outline-none font-bold text-xs"
                      />
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[11px] font-bold text-slate-655 flex items-center gap-1">
                        <CreditCard className="w-3.5 h-3.5 text-slate-400" /> Card ({currencySymbol})
                      </span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        value={splitPayments.card}
                        onChange={(e) =>
                          setSplitPayments((prev) => ({
                            ...prev,
                            card: e.target.value === '' ? '' : Number(e.target.value),
                          }))
                        }
                        className="w-24 text-right px-2.5 py-1 border border-slate-250 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl outline-none font-bold text-xs"
                      />
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[11px] font-bold text-slate-655 flex items-center gap-1">
                        <QrCode className="w-3.5 h-3.5 text-slate-400" /> Mobile ({currencySymbol})
                      </span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        value={splitPayments.mobile}
                        onChange={(e) =>
                          setSplitPayments((prev) => ({
                            ...prev,
                            mobile: e.target.value === '' ? '' : Number(e.target.value),
                          }))
                        }
                        className="w-24 text-right px-2.5 py-1 border border-slate-250 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl outline-none font-bold text-xs"
                      />
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[11px] font-bold text-slate-655 flex items-center gap-1">
                        <Coins className="w-3.5 h-3.5 text-slate-400" /> Account ({currencySymbol})
                      </span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        disabled={!selectedCustomer}
                        value={splitPayments.on_account}
                        onChange={(e) =>
                          setSplitPayments((prev) => ({
                            ...prev,
                            on_account: e.target.value === '' ? '' : Number(e.target.value),
                          }))
                        }
                        className="w-24 text-right px-2.5 py-1 border border-slate-250 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl outline-none font-bold text-xs disabled:opacity-40 disabled:cursor-not-allowed"
                      />
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between text-[10px] font-black">
                      <span className="text-slate-400">Total Applied:</span>
                      <span
                        className={
                          Math.abs(splitSum - remainingAmount) < 0.01
                            ? 'text-emerald-500'
                            : 'text-red-500'
                        }
                      >
                        {formatCurrency(splitSum, currencySymbol)} / {formatCurrency(remainingAmount, currencySymbol)}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Customer Credit Profile */}
              {selectedCustomer && (
                <div className="space-y-2 p-3 bg-slate-50/50 dark:bg-slate-955 rounded-2xl border border-slate-100 dark:border-slate-850">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-700 dark:text-slate-355">Customer Profile</span>
                    {selectedCustomer.creditHold && (
                      <span className="px-2 py-0.5 bg-red-100 dark:bg-red-950/30 text-red-655 text-[9px] font-black rounded-full uppercase tracking-wider">
                        Credit Hold
                      </span>
                    )}
                  </div>
                  <div className="bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-100 dark:border-slate-800 text-[10px]">
                    <p className="text-slate-400 font-bold uppercase tracking-wider">Credit Limit / Debt</p>
                    <p className="text-sm font-black text-slate-800 dark:text-white">
                      {formatCurrency(selectedCustomer.creditLimit || 0, currencySymbol)} / {formatCurrency(outstandingBalance, currencySymbol)}
                    </p>
                  </div>
                </div>
              )}

              {/* Wallet Payment Input */}
              {paymentMethod === 'wallet' && selectedCustomer && (
                <div className="space-y-2 p-3 bg-violet-50/60 dark:bg-violet-955/20 rounded-2xl border border-violet-250 dark:border-violet-800">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 font-bold text-violet-700 dark:text-violet-300">
                      <Wallet className="w-3.5 h-3.5" /> Wallet Balance
                    </span>
                    <span className="text-sm font-black text-violet-700 dark:text-violet-300">
                      {walletBalance === 0 ? (
                        <span className="text-slate-400 text-[10px] font-bold">Loading…</span>
                      ) : (
                        formatCurrency(walletBalance, currencySymbol)
                      )}
                    </span>
                  </div>
                  {walletBalance > 0 ? (
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-violet-655 dark:text-violet-400 font-bold">Apply Amount ({currencySymbol})</span>
                      <input
                        type="number"
                        min="0.01"
                        max={walletBalance}
                        value={walletAmountToUse}
                        onChange={(e) =>
                          setWalletAmountToUse(e.target.value === '' ? '' : Number(e.target.value))
                        }
                        className="w-28 text-right px-2 py-1 border border-violet-300 dark:border-violet-700 bg-white dark:bg-slate-900 rounded-lg outline-none font-bold text-xs focus:ring-1 focus:ring-violet-500"
                      />
                    </div>
                  ) : (
                    walletBalance === 0 && (
                      <p className="text-[10px] text-slate-400 font-bold text-center py-1">No wallet balance available for this customer.</p>
                    )
                  )}
                </div>
              )}

              {/* Delivery Zone and Shipping Address Selector */}
              <div className="space-y-3 p-4 bg-slate-50/50 dark:bg-slate-950/50 rounded-2xl border border-slate-100 dark:border-slate-850">
                <div className="space-y-1">
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">
                    Delivery Zone / Shipping Channel
                  </label>
                  <select
                    value={deliveryZone}
                    onChange={(e) => setDeliveryZone(e.target.value)}
                    className="w-full px-3 py-2.5 text-xs font-bold border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-white rounded-xl outline-none focus:ring-1 focus:ring-brand-500"
                  >
                    {DELIVERY_ZONES.map((zone) => (
                      <option key={zone.name} value={zone.name}>
                        {zone.name} {zone.fee > 0 ? `(+${formatCurrency(zone.fee, currencySymbol)})` : '(Free Counter Pickup)'}
                      </option>
                    ))}
                  </select>
                </div>

                {deliveryZone && deliveryZone !== 'Store Counter Pickup' && (
                  <div className="space-y-1">
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">
                      Delivery/Shipping Address
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Enter customer's full shipping address..."
                      value={shippingAddress}
                      onChange={(e) => setShippingAddress(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-bold border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-white rounded-xl outline-none focus:ring-1 focus:ring-brand-500 resize-none placeholder:text-slate-350"
                    />
                  </div>
                )}
              </div>

              {/* Amount details */}
              <div className="p-4 bg-slate-50 dark:bg-slate-955 rounded-2xl space-y-2">
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Cart Total (Incl. Tax)</span>
                  <span className="font-bold text-slate-800 dark:text-white">
                    {formatCurrency(taxableAmount + tax, currencySymbol)}
                  </span>
                </div>
                {shippingFee > 0 && (
                  <div className="flex justify-between text-xs text-emerald-500 font-bold">
                    <span>Delivery Shipping Fee</span>
                    <span>+{formatCurrency(shippingFee, currencySymbol)}</span>
                  </div>
                )}
                <div className="flex justify-between text-xs font-black text-slate-905 dark:text-white pt-2 border-t border-slate-105 dark:border-slate-850">
                  <span>Grand Payable Total</span>
                  <span className="text-brand-600 dark:text-brand-400 font-black">
                    {formatCurrency(grandTotal, currencySymbol)}
                  </span>
                </div>

                {paymentMethod === 'cash' && (
                  <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-855">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-500">Amount Tendered</span>
                      <input
                        type="number"
                        value={amountTendered}
                        onChange={(e) =>
                          setAmountTendered(e.target.value === '' ? '' : Number(e.target.value))
                        }
                        placeholder="0.00"
                        className="w-28 text-right px-2.5 py-1.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl outline-none font-black text-sm text-slate-900 dark:text-white"
                      />
                    </div>

                    {/* Cash denomination buttons */}
                    <div className="pt-2">
                      <p className="text-[9px] font-black uppercase tracking-wider text-slate-400 mb-1.5">Quick Tender Cash</p>
                      <div className="grid grid-cols-3 gap-1.5">
                        <button
                          type="button"
                          onClick={() => setAmountTendered(grandTotal)}
                          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 text-[10px] font-black rounded-lg text-slate-700 dark:text-white transition-all text-center"
                        >
                          Exact Cash
                        </button>
                        {[5, 10, 20, 50, 100].map((val) => (
                          <button
                            key={val}
                            type="button"
                            onClick={() => setAmountTendered(val)}
                            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-855 dark:hover:bg-slate-800 text-[10px] font-black rounded-lg text-slate-700 dark:text-white transition-all text-center"
                          >
                            {formatCurrency(val, currencySymbol)}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-between text-xs text-slate-500 pt-1">
                      <span>Change Due</span>
                      <span
                        className={`font-black text-sm ${changeDue >= 0 ? 'text-emerald-500' : 'text-red-500'}`}
                      >
                        {formatCurrency(changeDue, currencySymbol)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 bg-slate-50 dark:bg-slate-955 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 text-xs font-bold text-slate-505 hover:bg-white dark:hover:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={processingPayment}
                onClick={handleConfirmCheckout}
                className="px-6 py-2.5 bg-slate-900 hover:bg-slate-850 dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 text-white font-black rounded-xl shadow-lg transition-all flex items-center gap-2"
              >
                {processingPayment ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Coins className="w-4 h-4" />
                )}
                Process Complete sale
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
