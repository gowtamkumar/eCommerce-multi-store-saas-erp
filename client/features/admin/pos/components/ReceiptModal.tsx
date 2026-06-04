import { AnimatePresence, motion } from 'framer-motion';
import { X, Receipt, Printer } from 'lucide-react';
import type { PosShift, TransactionHistory, TransactionItem } from '../type';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  lastTransaction: TransactionHistory;
  activeShift: PosShift | null;
  taxName: string;
  taxRate: number;
}

export default function ReceiptModal({
  isOpen,
  onClose,
  lastTransaction,
  activeShift,
  taxName,
  taxRate,
}: ReceiptModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col"
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-105 dark:border-slate-850 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-emerald-500" />
                <h3 className="text-sm font-black text-slate-900 dark:text-white">Transaction Success</h3>
              </div>
              <button
                onClick={onClose}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-805 rounded-lg"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            {/* Receipt Area (Stylized POS Layout) */}
            <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50 dark:bg-slate-950/20 max-h-[60vh] font-mono text-xs text-slate-800 dark:text-slate-300">
              <div id="thermal-receipt" className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-850 shadow-sm space-y-4">
                {/* Store Info */}
                <div className="text-center space-y-1">
                  <h2 className="text-base font-black tracking-wider uppercase text-slate-900 dark:text-white">STORE REGISTER</h2>
                  <p className="text-[10px] text-slate-400">Terminal: {activeShift?.register?.name || 'Counter 1'}</p>
                  <p className="text-[9px] text-slate-400">Date: {lastTransaction.date}</p>
                  <p className="text-[9px] text-slate-400">Receipt: {lastTransaction.receiptNo}</p>
                </div>

                <div className="border-b border-dashed border-slate-200 dark:border-slate-800" />

                {/* Customer Info if linked */}
                {lastTransaction.customer && (
                  <div className="space-y-0.5 text-[10px]">
                    <p className="font-bold text-slate-900 dark:text-white">Customer Profile:</p>
                    <p>Name: {lastTransaction.customer.name}</p>
                    <p>Phone: {lastTransaction.customer.phone || 'N/A'}</p>
                  </div>
                )}

                {lastTransaction.customer && <div className="border-b border-dashed border-slate-200 dark:border-slate-800" />}

                {/* Item Rows */}
                <div className="space-y-2">
                  <div className="flex justify-between font-black text-slate-900 dark:text-white text-[10px]">
                    <span>Item Description</span>
                    <span>Total</span>
                  </div>
                  {lastTransaction.items.map((item: TransactionItem, idx: number) => (
                    <div key={idx} className="flex justify-between items-start text-[10px] leading-tight">
                      <div className="min-w-0 pr-4">
                        <p className="font-bold text-slate-850 dark:text-slate-350 truncate">{item.product.name}</p>
                        {item.variant && (
                          <p className="text-[8px] text-slate-450 font-sans">
                            {Object.entries(item.variant.combination || {}).map(([k, v]) => `${k}:${v}`).join('/')}
                          </p>
                        )}
                        <p className="text-[9px] text-slate-450">{item.quantity} x ${item.price.toFixed(2)}</p>
                      </div>
                      <span className="font-black text-slate-900 dark:text-white">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="border-b border-dashed border-slate-200 dark:border-slate-800" />

                {/* Totals Summary */}
                <div className="space-y-1.5 text-[10px]">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${lastTransaction.subtotal.toFixed(2)}</span>
                  </div>
                  {(lastTransaction.catalogDiscount + lastTransaction.discount + lastTransaction.couponDiscount) > 0 && (
                    <div className="flex justify-between text-emerald-500 font-bold">
                      <span>Discount</span>
                      <span>-${(lastTransaction.catalogDiscount + lastTransaction.discount + lastTransaction.couponDiscount).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>{taxName} ({taxRate}%)</span>
                    <span>${lastTransaction.tax.toFixed(2)}</span>
                  </div>
                  {lastTransaction.couponDiscount > 0 && (
                    <div className="flex justify-between text-emerald-500 font-bold">
                      <span>Coupon ({lastTransaction.couponCode})</span>
                      <span>-${lastTransaction.couponDiscount.toFixed(2)}</span>
                    </div>
                  )}
                  {lastTransaction.shippingFee > 0 && (
                    <div className="flex justify-between text-emerald-500 font-bold">
                      <span>Shipping ({lastTransaction.deliveryZone})</span>
                      <span>+${lastTransaction.shippingFee.toFixed(2)}</span>
                    </div>
                  )}
                  {lastTransaction.walletDeduction > 0 && (
                    <div className="flex justify-between text-emerald-500 font-bold">
                      <span>Store Credit / Wallet</span>
                      <span>-${lastTransaction.walletDeduction.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-black text-slate-900 dark:text-white pt-1.5 border-t border-slate-100 dark:border-slate-800">
                    <span>Grand Total</span>
                    <span>${lastTransaction.grandTotal.toFixed(2)}</span>
                  </div>
                </div>

                <div className="border-b border-dashed border-slate-200 dark:border-slate-800" />

                {/* Payment Tender details */}
                <div className="space-y-1 text-[9px] text-slate-455">
                  <div className="flex justify-between">
                    <span>Payment Mode</span>
                    <span className="font-bold uppercase">{lastTransaction.paymentMethod}</span>
                  </div>
                  {lastTransaction.splitPayments && lastTransaction.splitPayments.length > 0 ? (
                    <div className="pl-2 space-y-0.5 border-l border-slate-150 dark:border-slate-850">
                      {lastTransaction.splitPayments.map((p: { method: string; amount: number }, idx: number) => (
                        <div key={idx} className="flex justify-between text-[8px]">
                          <span>- {p.method}</span>
                          <span>${Number(p.amount).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex justify-between">
                      <span>Amount Collected</span>
                      <span>${lastTransaction.amountTendered.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-[10px] font-bold text-slate-700 dark:text-slate-350">
                    <span>Change Given Back</span>
                    <span>${lastTransaction.changeDue.toFixed(2)}</span>
                  </div>
                </div>

                <div className="border-b border-dashed border-slate-200 dark:border-slate-800" />

                {/* Footer message */}
                <div className="text-center text-[9px] text-slate-400 pt-2 space-y-1 leading-tight">
                  <p className="font-bold uppercase tracking-wider text-slate-900 dark:text-white">Thank You for your visit!</p>
                  <p>Receipt generated via Automated Accounting Engine</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="p-6 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-850 flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-2.5 bg-slate-250 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-800 dark:text-white text-xs font-bold rounded-xl transition-all"
              >
                Close Receipt
              </button>
              <button
                onClick={() => {
                  const printContent = document.getElementById('thermal-receipt')?.innerHTML;
                  if (printContent) {
                    const printWindow = window.open('', '_blank', 'width=300,height=600');
                    if (printWindow) {
                      printWindow.document.write(`
                        <html>
                          <head>
                            <title>Receipt</title>
                            <style>
                              body { font-family: monospace; padding: 15px; font-size: 11px; max-width: 280px; margin: 0 auto; color: #000; }
                              .text-center { text-align: center; }
                              .space-y-1 > * { margin-bottom: 2px; }
                              .space-y-2 > * { margin-bottom: 4px; }
                              .flex { display: flex; }
                              .justify-between { justify-content: space-between; }
                              .border-dashed { border-bottom: 1px dashed #000; margin: 10px 0; }
                              .font-black { font-weight: bold; }
                              .text-sm { font-size: 12px; }
                              .text-base { font-size: 14px; }
                            </style>
                          </head>
                          <body>
                            \${printContent}
                            <script>
                              window.onload = function() { window.print(); window.close(); }
                            </script>
                          </body>
                        </html>
                      `);
                      printWindow.document.close();
                    }
                  }
                }}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl shadow-lg transition-all flex items-center justify-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" /> Print Thermal
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
