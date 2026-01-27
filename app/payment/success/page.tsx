"use client";

import { useDownloadInvoice } from "@/lib/handleDownloadInvoice";
import { Check } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const tran_id = searchParams.get("tran_id");
  const { downloadInvoice } = useDownloadInvoice();

  // Ideally fetch order details here using tran_id
  // For now we show the simple success message

  return (
    <div className="container mx-auto px-4 flex items-center justify-center min-h-[60vh]">
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-8 max-w-lg w-full text-center">
        <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <Check className="w-12 h-12 text-green-600 dark:text-green-400" />
        </div>

        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 font-display">Payment Successful!</h1>
        <p className="text-slate-600 dark:text-slate-300 mb-8">
          Your payment has been processed successfully.
        </p>

        {tran_id && (
          <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl mb-8 border border-slate-100 dark:border-slate-700">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Transaction ID</p>
            <p className="font-mono font-medium text-slate-900 dark:text-white break-all">{tran_id}</p>
          </div>
        )}

        <div className="space-y-3">
          <Link
            href="/account/orders"
            className="block w-full py-3.5 bg-brand-600 text-white font-bold rounded-xl hover:bg-brand-700 transition-colors"
          >
            View My Orders
          </Link>
          <Link
            href="/"
            className="block w-full py-3.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-white font-bold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div className="text-center p-10">Loading...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
