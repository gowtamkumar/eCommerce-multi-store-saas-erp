"use client";

import { ReturnModalProps } from "@/features/admin/return/types";
import { useSettings } from "@/hooks/SettingsContext";
import { RefundMethod, ReturnType } from "@/lib/enums/refund-method.enum";
import { fetchAPI } from "@/services/api";
import { ChangeEvent, useState } from "react";
import toast from "react-hot-toast";



export default function ReturnModal({ orderId, item, onClose, onSuccess, apiPath }: ReturnModalProps) {
  const { formatPrice } = useSettings();
  const [reason, setReason] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [returnType, setReturnType] = useState<ReturnType>(ReturnType.REFUND);
  const [refundMethod, setRefundMethod] = useState<RefundMethod>(RefundMethod.STORE_CREDIT);
  const actionLabel = returnType === ReturnType.EXCHANGE ? 'Request Exchange' : 'Request Refund';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetchAPI(apiPath ?? "/returns", {
        method: "POST",
        body: JSON.stringify({
          orderId,
          reason,
          returnType,
          refundMethod,
          items: [
            {
              productId: item.productId,
              variantId: item.variantId,
              quantity: quantity,
            },
          ],
        }),
      });
      if (res.success || res.id) { // res.id check as typeorm save returns entity
        toast.success("Return requested successfully!");
        onSuccess();
      } else {
        toast.error(res.message || "Failed to request return");
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "An error occurred"
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-70 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-white/10 p-6">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
          Return / Exchange Request
        </h3>
        <div className="mb-4 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
          <p className="font-semibold text-slate-900 dark:text-white text-sm">
            {item.productName}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Refund Estimate: {formatPrice((item.price - item.discount) * quantity)}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">What would you like to do?</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setReturnType(ReturnType.REFUND)}
                className={`px-4 py-3 rounded-2xl border text-sm font-semibold transition ${returnType === ReturnType.REFUND
                  ? 'bg-brand-600 text-white border-brand-600'
                  : 'bg-white text-slate-700 border-slate-200 dark:bg-slate-900 dark:text-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
              >
                Refund
              </button>
              <button
                type="button"
                onClick={() => setReturnType(ReturnType.EXCHANGE)}
                className={`px-4 py-3 rounded-2xl border text-sm font-semibold transition ${returnType === ReturnType.EXCHANGE
                  ? 'bg-brand-600 text-white border-brand-600'
                  : 'bg-white text-slate-700 border-slate-200 dark:bg-slate-900 dark:text-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
              >
                Exchange
              </button>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {returnType === ReturnType.EXCHANGE
                ? 'For walk-in exchanges, the return is processed here and should be refunded via CASH or CARD. Ring up the replacement items as a new sale.'
                : 'Refund requests can be issued as store credit, cash, card, mobile payment, or bank transfer.'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              {returnType === ReturnType.EXCHANGE ? 'Exchange Refund Method' : 'Refund Method'}
            </label>
            <select
              value={refundMethod}
              onChange={(e: ChangeEvent<HTMLSelectElement>) => setRefundMethod(e.target.value as RefundMethod)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
            >
              <option value="store_credit">Store Credit (Wallet)</option>
              <option value="cash">Cash Refund</option>
              <option value="card">Card / Bank Refund</option>
              <option value="mobile">Mobile Payment Refund</option>
              <option value="bank_transfer">Bank Transfer</option>
            </select>
            {returnType === ReturnType.EXCHANGE && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                If this is a walk-in exchange, choose CASH or CARD and ring up the exchanged products in a separate sale.
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Reason for Return
            </label>
            <select
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
            >
              <option value="">Select a reason</option>
              <option value="Damaged/Defective">Damaged or Defective</option>
              <option value="Wrong Item">Wrong Item Received</option>
              <option value="Size/Fit Issue">Size/Fit Issue</option>
              <option value="Not as Described">Not as Described</option>
              <option value="Changed Mind">Changed Mind</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Quantity to Return (Max {item.quantity})
            </label>
            <select
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
            >
              {Array.from({ length: item.quantity }, (_, i) => i + 1).map((q) => (
                <option key={q} value={q}>
                  {q}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !reason}
              className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-50"
            >
              {loading ? "Submitting..." : actionLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
