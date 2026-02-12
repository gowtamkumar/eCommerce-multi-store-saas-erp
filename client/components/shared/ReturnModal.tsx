"use client";

import { useSettings } from "@/hooks/SettingsContext";
import { fetchAPI } from "@/services/api";
import { useState } from "react";
import toast from "react-hot-toast";

interface ReturnModalProps {
  orderId: string;
  item: {
    id: string; // Order Item ID (not used for logic but unique key)
    productId: string;
    variantId?: string;
    productName: string;
    quantity: number;
    price: number;
    discount: number;
  };
  onClose: () => void;
  onSuccess: () => void;
}

export default function ReturnModal({ orderId, item, onClose, onSuccess }: ReturnModalProps) {
  const { formatPrice } = useSettings();
  const [reason, setReason] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetchAPI("/returns", {
        method: "POST",
        body: JSON.stringify({
          orderId,
          reason,
          items: [
            {
              productId: item.productId,
              variantId: item.variantId,
              quantity: quantity,
            },
          ],
        }),
      });

      console.log("returns", res);

      if (res.success || res.id) { // res.id check as typeorm save returns entity
        toast.success("Return requested successfully!");
        onSuccess();
      } else {
        toast.error(res.message || "Failed to request return");
      }
    } catch (error: any) {
      toast.error(error.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[70] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-white/10 p-6">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
          Return Item
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
              {loading ? "Submitting..." : "Request Return"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
