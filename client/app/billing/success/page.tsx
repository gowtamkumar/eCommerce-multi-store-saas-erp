"use client";

import { useSettings } from "@/hooks/SettingsContext";
import { Check, Loader2 } from "lucide-react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, Suspense, useState, useRef } from "react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tran_id = searchParams.get("tran_id");
  const { refreshSettings } = useSettings();
  const [isRefreshing, setIsRefreshing] = useState(true);
  const hasTriggered = useRef(false);

  useEffect(() => {
    if (!tran_id || hasTriggered.current) return;
    hasTriggered.current = true;

    const updateSettings = async () => {
      try {
        // Call backend complete/success to ensure store is updated
        if (tran_id) {
          const { fetchAPI } = await import("@/services/api");
          await fetchAPI(`/billing/complete/success?tran_id=${tran_id}`, {
            method: "POST",
            body: JSON.stringify({ message: "Success from frontend" })
          });
        }

        await refreshSettings();
        // Give it a tiny bit of time to propagate
        setTimeout(() => setIsRefreshing(false), 2000);
      } catch (error) {
        console.error("Failed to refresh settings:", error);
        setIsRefreshing(false);
      }
    };
    updateSettings();
  }, [refreshSettings, tran_id]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl p-8 max-w-lg w-full text-center border border-slate-100 dark:border-slate-700">
        <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <Check className="w-12 h-12 text-green-600 dark:text-green-400" />
        </div>

        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 font-display">Subscription Renewed!</h1>
        <p className="text-slate-600 dark:text-slate-300 mb-8">
          Your payment was successful and your subscription has been updated.
        </p>

        {tran_id && (
          <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl mb-8 border border-slate-100 dark:border-slate-700 font-mono text-sm">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Transaction ID</p>
            <p className="font-medium text-slate-900 dark:text-white break-all">{tran_id}</p>
          </div>
        )}

        <div className="space-y-4">
          <button
            onClick={() => router.push("/admin")}
            disabled={isRefreshing}
            className="w-full py-4 bg-brand-600 text-white font-bold rounded-2xl hover:bg-brand-700 transition-all shadow-lg shadow-brand-500/25 flex items-center justify-center gap-2 group disabled:opacity-70"
          >
            {isRefreshing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Updating Status...
              </>
            ) : (
              <>
                Go to Dashboard
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </>
            )}
          </button>

          {!isRefreshing && (
            <p className="text-xs text-slate-400">
              Settings refreshed. You can now access all features.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SubscriptionSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
