"use client";

import { XCircle, RefreshCw, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState, useRef } from "react";
import { fetchAPI } from "@/services/api";

function FailContent() {
  const searchParams = useSearchParams();
  const tran_id = searchParams.get("tran_id");
  const [isReporting, setIsReporting] = useState(true);
  const hasTriggered = useRef(false);

  useEffect(() => {
    if (!tran_id || hasTriggered.current) {
      setIsReporting(false);
      return;
    }
    hasTriggered.current = true;

    const reportFail = async () => {
      try {
        await fetchAPI(`/billing/complete/fail?tran_id=${tran_id}`, {
          method: "POST",
          body: JSON.stringify({ source: "admin_settings" })
        });
      } catch (error) {
        console.error("Failed to report payment failure:", error);
      } finally {
        setIsReporting(false);
      }
    };

    reportFail();
  }, [tran_id]);

  if (isReporting) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 font-display">
        <Loader2 className="w-12 h-12 animate-spin text-rose-600" />
        <p className="text-slate-500 dark:text-slate-400 font-black uppercase tracking-[0.2em] text-[10px] animate-pulse">Processing payment result...</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[60vh] p-6 font-display">
      <div className="bg-white dark:bg-slate-800 rounded-[3rem] shadow-2xl p-10 max-w-lg w-full text-center border border-slate-100 dark:border-slate-700/50">
        <div className="w-24 h-24 bg-rose-50 dark:bg-rose-900/20 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-xl shadow-rose-500/10">
          <XCircle className="w-12 h-12 text-rose-600 dark:text-rose-400 animate-pulse" />
        </div>

        <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-3 uppercase tracking-tight">Payment Failed</h1>
        <p className="text-slate-500 dark:text-slate-400 mb-10 font-medium">
          Something went wrong while processing your payment. No funds were captured. Please try again.
        </p>

        {tran_id && (
          <div className="bg-slate-50 dark:bg-slate-900/50 p-5 rounded-2xl mb-10 border border-slate-100 dark:border-slate-700/50">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Transaction ID</p>
            <p className="font-mono font-bold text-slate-900 dark:text-white break-all text-sm">{tran_id}</p>
          </div>
        )}

        <div className="space-y-4">
          <Link
            href="/admin/settings/billing"
            className="flex items-center justify-center gap-2 w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black uppercase tracking-widest rounded-2xl hover:bg-brand-600 hover:text-white dark:hover:bg-brand-600 dark:hover:text-white transition-all shadow-xl shadow-slate-900/10 active:scale-95"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </Link>
          <Link
            href="/admin"
            className="flex items-center justify-center gap-2 w-full py-4 text-slate-500 hover:text-slate-900 dark:hover:text-white font-bold transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function SubscriptionFailPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center p-20 font-black text-slate-400 animate-pulse uppercase tracking-[0.3em]">Processing...</div>}>
      <FailContent />
    </Suspense>
  );
}
