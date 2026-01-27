"use client";

import { AlertCircle, RefreshCcw } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function FailContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const tran_id = searchParams.get("tran_id");

  return (
    <div className="container mx-auto px-4 flex items-center justify-center min-h-[60vh]">
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-8 max-w-lg w-full text-center">
        <div className="w-24 h-24 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-12 h-12 text-red-600 dark:text-red-400" />
        </div>

        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 font-display">Payment Failed</h1>
        <p className="text-slate-600 dark:text-slate-300 mb-8">
          We couldn't process your payment. Please try again.
        </p>

        {(error || tran_id) && (
          <div className="bg-red-50 dark:bg-red-900/10 p-4 rounded-xl mb-8 border border-red-100 dark:border-red-900/20 text-left">
            {tran_id && (
              <div className="mb-2">
                <p className="text-xs text-red-500 uppercase tracking-wider mb-0.5">Transaction ID</p>
                <p className="font-mono text-sm font-medium text-red-700 dark:text-red-400 break-all">{tran_id}</p>
              </div>
            )}
            {error && (
              <div>
                <p className="text-xs text-red-500 uppercase tracking-wider mb-0.5">Error Details</p>
                <p className="font-mono text-sm font-medium text-red-700 dark:text-red-400">{error}</p>
              </div>
            )}
          </div>
        )}

        <div className="space-y-3">
          <Link
            href="/checkout"
            className="block w-full py-3.5 bg-brand-600 text-white font-bold rounded-xl hover:bg-brand-700 transition-colors flex items-center justify-center gap-2"
          >
            <RefreshCcw className="w-5 h-5" />
            Try Again
          </Link>
          <Link
            href="/contact"
            className="block w-full py-3.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-white font-bold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
          >
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function PaymentFailPage() {
  return (
    <Suspense fallback={<div className="text-center p-10">Loading...</div>}>
      <FailContent />
    </Suspense>
  );
}
