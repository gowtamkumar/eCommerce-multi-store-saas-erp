"use client";

import { AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";

function CancelContent() {
  const searchParams = useSearchParams();
  const tran_id = searchParams.get("tran_id");

  useEffect(() => {
    const reportCancel = async () => {
      try {
        if (tran_id) {
          const { fetchAPI } = await import("@/services/api");
          await fetchAPI(`/billing/complete/cancel?tran_id=${tran_id}`, {
            method: "POST",
            body: JSON.stringify({ message: "Cancellation from frontend" })
          });
        }
      } catch (error) {
        console.error("Failed to report payment cancellation:", error);
      }
    };
    reportCancel();
  }, [tran_id]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl p-8 max-w-lg w-full text-center border border-slate-100 dark:border-slate-700">
        <div className="w-24 h-24 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-12 h-12 text-amber-600 dark:text-amber-400" />
        </div>

        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 font-display">Payment Cancelled</h1>
        <p className="text-slate-600 dark:text-slate-300 mb-8">
          The payment process was cancelled. No charges were made.
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
        </div>
      </div>
    </div>
  );
}

export default function SubscriptionCancelPage() {
  return (
    <Suspense fallback={null}>
      <CancelContent />
    </Suspense>
  );
}
