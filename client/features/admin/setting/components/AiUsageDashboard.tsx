"use client";

import {
  AI_USAGE_PERIOD_OPTIONS,
  formatAiUsageEndpoint,
  formatTokenCount,
  type AiUsageSummary,
} from "../types/ai-usage";
import { BarChart3, Loader2, RefreshCw } from "lucide-react";

interface AiUsageDashboardProps {
  enabled: boolean;
  days: number;
  onDaysChange: (days: number) => void;
  loading: boolean;
  summary: AiUsageSummary | null;
  onRefresh: () => void;
}

function UsageBar({
  label,
  value,
  max,
  sublabel,
}: {
  label: string;
  value: number;
  max: number;
  sublabel?: string;
}) {
  const width = max > 0 ? Math.max(4, Math.round((value / max) * 100)) : 0;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="font-medium text-slate-700 dark:text-slate-300">{label}</span>
        <span className="font-mono text-slate-600 dark:text-slate-400">
          {formatTokenCount(value)}
          {sublabel ? <span className="text-slate-400 ml-1">({sublabel})</span> : null}
        </span>
      </div>
      <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
        <div
          className="h-full rounded-full bg-brand-500 transition-all duration-300"
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}

export function AiUsageDashboard({
  enabled,
  days,
  onDaysChange,
  loading,
  summary,
  onRefresh,
}: AiUsageDashboardProps) {
  const maxDayTokens =
    summary?.byDay.reduce((max, day) => Math.max(max, day.totalTokens), 0) ?? 0;

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/40 p-5 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-slate-900 dark:text-white">Token usage</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Estimated tokens sent to your AI provider (BYOK). Billing stays with your provider
              account — this dashboard helps you monitor adoption and cost drivers.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <select
            value={days}
            onChange={(e) => onDaysChange(Number(e.target.value))}
            disabled={!enabled || loading}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-brand-500/20"
          >
            {AI_USAGE_PERIOD_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={onRefresh}
            disabled={!enabled || loading}
            className="inline-flex items-center justify-center w-10 h-10 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
            title="Refresh usage"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {!enabled ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Enable AI above to start tracking token usage for this store.
        </p>
      ) : loading && !summary ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="w-6 h-6 animate-spin text-brand-600" />
        </div>
      ) : summary ? (
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-900/50 px-4 py-4">
              <p className="text-sm text-slate-500">Total tokens</p>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                {summary.totalTokens.toLocaleString()}
              </p>
              <p className="text-xs text-slate-400 mt-1">Last {summary.days} days</p>
            </div>
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-900/50 px-4 py-4">
              <p className="text-sm text-slate-500">AI requests</p>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                {summary.totalRequests.toLocaleString()}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {summary.totalRequests === 0
                  ? "No activity recorded yet"
                  : `~${Math.round(summary.totalTokens / Math.max(summary.totalRequests, 1))} tokens / request`}
              </p>
            </div>
          </div>

          {(summary.byEndpoint?.length ?? 0) > 0 ? (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">By endpoint</p>
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {summary.byEndpoint.map((row) => (
                  <UsageBar
                    key={row.endpoint}
                    label={formatAiUsageEndpoint(row.endpoint)}
                    value={row.totalTokens}
                    max={summary.totalTokens}
                    sublabel={`${row.requestCount} req`}
                  />
                ))}
              </div>
            </div>
          ) : summary.byOperation.length > 0 ? (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">By type</p>
              {summary.byOperation.map((row) => (
                <UsageBar
                  key={row.operation}
                  label={row.operation}
                  value={row.totalTokens}
                  max={summary.totalTokens}
                  sublabel={`${row.requestCount} req`}
                />
              ))}
            </div>
          ) : null}

          {summary.byDay.length > 0 ? (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Daily activity</p>
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {[...summary.byDay].reverse().map((day) => (
                  <UsageBar
                    key={day.date}
                    label={new Date(`${day.date}T12:00:00`).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })}
                    value={day.totalTokens}
                    max={maxDayTokens}
                    sublabel={`${day.requestCount} req`}
                  />
                ))}
              </div>
            </div>
          ) : summary.totalRequests === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Usage appears here after staff use AI Studio, inline assists, storefront search, or
              embedding reindex runs.
            </p>
          ) : null}
        </>
      ) : (
        <p className="text-sm text-slate-500">Unable to load usage data. Try refreshing.</p>
      )}
    </div>
  );
}
