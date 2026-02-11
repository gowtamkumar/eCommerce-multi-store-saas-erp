"use client";

import { XCircle } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function CancelContent() {
  const searchParams = useSearchParams();
  const tran_id = searchParams.get("tran_id");

  return (
    <div className="container mx-auto px-4 flex items-center justify-center min-h-[60vh]">
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-8 max-w-lg w-full text-center">
        <div className="w-24 h-24 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle className="w-12 h-12 text-slate-500 dark:text-slate-400" />
        </div>

        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 font-display">Payment Cancelled</h1>
        <p className="text-slate-600 dark:text-slate-300 mb-8">
          You have cancelled the payment process. No charges were made.
        </p>

        <div className="space-y-3">
          <Link
            href="/checkout"
            className="block w-full py-3.5 bg-brand-600 text-white font-bold rounded-xl hover:bg-brand-700 transition-colors"
          >
            Return to Checkout
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

export default function PaymentCancelPage() {
  return (
    <Suspense fallback={<div className="text-center p-10">Loading...</div>}>
      <CancelContent />
    </Suspense>
  );
}
