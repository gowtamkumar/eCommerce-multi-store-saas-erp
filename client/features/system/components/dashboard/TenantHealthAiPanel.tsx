"use client";

import { usePlatformAiConfig } from "@/features/system/hooks/usePlatformAiConfig";
import { fetchSuperAdminAPI } from "@/services/superAdminApi";
import { AlertTriangle, Loader2, RefreshCw, Sparkles } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

export type TenantHealthRiskLevel = "low" | "moderate" | "elevated" | "critical";

export interface TenantHealthNarrative {
  summary: string;
  riskLevel: TenantHealthRiskLevel;
  keySignals: string[];
  recommendedActions: string[];
}

const RISK_STYLES: Record<TenantHealthRiskLevel, string> = {
  low: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
  moderate: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  elevated: "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300",
  critical: "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300",
};

interface TenantHealthAiPanelProps {
  days: number;
}

export function TenantHealthAiPanel({ days }: TenantHealthAiPanelProps) {
  const { configured } = usePlatformAiConfig();
  const [loading, setLoading] = useState(false);
  const [narrative, setNarrative] = useState<TenantHealthNarrative | null>(null);

  const generate = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchSuperAdminAPI("/super-admin/ai/generate/tenant-health-narrative", {
        method: "POST",
        body: JSON.stringify({ days }),
      });
      if (res.data) {
        setNarrative({
          summary: res.data.summary,
          riskLevel: res.data.riskLevel,
          keySignals: res.data.keySignals || [],
          recommendedActions: res.data.recommendedActions || [],
        });
      }
    } catch {
      toast.error("Failed to generate tenant health narrative");
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => {
    setNarrative(null);
  }, [days]);

  if (configured === null) return null;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Tenant health insight</h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            AI churn-risk narrative from aggregate platform metrics only — no individual merchant names.
          </p>
        </div>

        {configured ? (
          <button
            type="button"
            onClick={generate}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl disabled:opacity-60 shrink-0"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : narrative ? (
              <RefreshCw className="w-4 h-4" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            {narrative ? "Refresh analysis" : "Generate analysis"}
          </button>
        ) : (
          <p className="text-xs text-amber-800 dark:text-amber-200 max-w-xs">
            <Link href="/system/settings?tab=ai" className="font-bold underline">
              Configure Platform AI
            </Link>{" "}
            to enable tenant health narratives.
          </p>
        )}
      </div>

      {!narrative && !loading ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Uses billing, subscription status, engagement buckets, and {days}-day trends across all tenants.
        </p>
      ) : null}

      {loading ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="w-7 h-7 animate-spin text-indigo-600" />
        </div>
      ) : null}

      {narrative && !loading ? (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-3">
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-black uppercase tracking-wider ${RISK_STYLES[narrative.riskLevel] || RISK_STYLES.moderate}`}
            >
              {narrative.riskLevel} churn risk
            </span>
            <span className="text-xs text-slate-400">Window: last {days} days</span>
          </div>

          <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-200">{narrative.summary}</p>

          {narrative.keySignals.length > 0 ? (
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2">Key signals</h3>
              <ul className="space-y-1.5">
                {narrative.keySignals.map((signal) => (
                  <li key={signal} className="text-sm text-slate-600 dark:text-slate-300 flex gap-2">
                    <span className="text-indigo-500 shrink-0">•</span>
                    <span>{signal}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {narrative.recommendedActions.length > 0 ? (
            <div className="rounded-2xl border border-indigo-100 dark:border-indigo-900/40 bg-indigo-50/50 dark:bg-indigo-950/20 p-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-2">
                Recommended actions
              </h3>
              <ul className="space-y-1.5">
                {narrative.recommendedActions.map((action) => (
                  <li key={action} className="text-sm text-slate-700 dark:text-slate-200 flex gap-2">
                    <span className="text-indigo-500 shrink-0">→</span>
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
