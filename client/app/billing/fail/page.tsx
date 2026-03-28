"use client";

import { XCircle, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function FailContent() {
  const searchParams = useSearchParams();
  const tran_id = searchParams.get("tran_id");
  const [isReporting, setIsReporting] = useState(true);

  useEffect(() => {
    const reportFail = async () => {
      try {
        if (tran_id) {
          const { fetchAPI } = await import("@/services/api");
          await fetchAPI(`/billing/complete/fail?tran_id=${tran_id}`, {
            method: "POST",
            body: JSON.stringify({ message: "Failure from frontend" })
          });
        }
        setTimeout(() => setIsReporting(false), 1000);
      } catch (error) {
        console.error("Failed to report payment failure:", error);
        setIsReporting(false);
      }
    };
    reportFail();
  }, [tran_id]);

  if (isReporting) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-red-600 mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400 font-medium">Processing payment result...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl p-8 max-w-lg w-full text-center border border-slate-100 dark:border-slate-700">
        <div className="w-24 h-24 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle className="w-12 h-12 text-red-600 dark:text-red-400" />
        </div>

        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 font-display">Payment Failed</h1>
        <p className="text-slate-600 dark:text-slate-300 mb-8">
          We couldn't process your payment. Please try again or use a different payment method.
        </p>

        {tran_id && (
          <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl mb-8 border border-slate-100 dark:border-slate-700 font-mono text-sm">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Transaction ID</p>
            <p className="font-medium text-slate-900 dark:text-white break-all">{tran_id}</p>
          </div>
        )}

        <div className="space-y-4">
          <Link
            href="/admin/settings/billing"
            className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-2xl hover:bg-slate-800 dark:hover:bg-slate-100 transition-all flex items-center justify-center gap-2 group shadow-xl"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            Back to Billing
          </Link>
          <p className="text-sm text-slate-500">
            If funds were deducted, please contact support.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SubscriptionFailPage() {
  return (
    <Suspense fallback={null}>
      <FailContent />
    </Suspense>
  );
}
