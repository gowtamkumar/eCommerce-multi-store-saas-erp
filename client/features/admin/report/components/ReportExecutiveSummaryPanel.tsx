"use client";

import { AiInlineBar } from "@/features/admin/ai/components/AiInlineBar";
import { useAiGenerate } from "@/features/admin/ai/hooks/useAiGenerate";
import { Check, Copy } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  buildReportExecutiveSummaryPayload,
  type ReportExecutiveSummaryType,
} from "../lib/buildReportExecutiveSummaryContext";

const labelClass = "text-[10px] font-black uppercase tracking-widest text-slate-400";
const inputClass =
  "w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all text-sm resize-y";

const REPORT_LABELS: Record<ReportExecutiveSummaryType, { title: string; hint: string }> = {
  "profit-loss": {
    title: "AI executive summary",
    hint: "Read-only P&L narrative — numbers from loaded report only",
  },
  "finance-summary": {
    title: "AI executive summary",
    hint: "Read-only finance overview narrative — numbers from loaded report only",
  },
  "cash-flow": {
    title: "AI executive summary",
    hint: "Read-only cash flow narrative — numbers from loaded report only",
  },
};

export interface ReportExecutiveSummaryPanelProps {
  reportType: ReportExecutiveSummaryType;
  reportSummary: string;
  disabled?: boolean;
}

export default function ReportExecutiveSummaryPanel({
  reportType,
  reportSummary,
  disabled,
}: ReportExecutiveSummaryPanelProps) {
  const { configured, loading, generateReportExecutiveSummary } = useAiGenerate();
  const [headline, setHeadline] = useState("");
  const [executiveSummary, setExecutiveSummary] = useState("");
  const [highlights, setHighlights] = useState<string[]>([]);
  const [watchItems, setWatchItems] = useState<string[]>([]);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const labels = REPORT_LABELS[reportType];
  const contextKey = useMemo(() => `${reportType}::${reportSummary}`, [reportType, reportSummary]);

  useEffect(() => {
    setHeadline("");
    setExecutiveSummary("");
    setHighlights([]);
    setWatchItems([]);
    setCopiedField(null);
  }, [contextKey]);

  const handleGenerate = async () => {
    try {
      const existingDraft = [headline, executiveSummary].filter(Boolean).join("\n\n");
      const result = await generateReportExecutiveSummary(
        buildReportExecutiveSummaryPayload(reportType, reportSummary, existingDraft),
      );
      if (!result) return;

      setHeadline(result.headline);
      setExecutiveSummary(result.executiveSummary);
      setHighlights(result.highlights || []);
      setWatchItems(result.watchItems || []);
      toast.success("Executive summary generated — read-only draft");
    } catch {
      toast.error("Failed to generate executive summary");
    }
  };

  const copyText = async (field: string, text: string) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      toast.success("Copied to clipboard");
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  const copyAll = async () => {
    const highlightBlock =
      highlights.length > 0
        ? `\n\nHighlights:\n${highlights.map((item) => `• ${item}`).join("\n")}`
        : "";
    const watchBlock =
      watchItems.length > 0
        ? `\n\nWatch items:\n${watchItems.map((item) => `• ${item}`).join("\n")}`
        : "";
    await copyText(
      "all",
      `${headline}\n\n${executiveSummary}${highlightBlock}${watchBlock}`,
    );
  };

  return (
    <div className="rounded-3xl border border-brand-100 dark:border-brand-900/40 bg-brand-50/40 dark:bg-brand-950/20 p-5 space-y-4">
      <AiInlineBar
        title={labels.title}
        hint={labels.hint}
        configured={configured}
        loading={loading}
        disabled={disabled || !reportSummary.trim()}
        onGenerate={handleGenerate}
      />

      {(highlights.length > 0 || watchItems.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {highlights.length > 0 && (
            <ul className="space-y-2 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 p-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-emerald-700 dark:text-emerald-300">
                Highlights
              </p>
              {highlights.map((item) => (
                <li key={item} className="text-xs font-medium text-emerald-900 dark:text-emerald-200 flex gap-2">
                  <span className="text-emerald-500">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          )}
          {watchItems.length > 0 && (
            <ul className="space-y-2 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 p-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-amber-700 dark:text-amber-300">
                Watch items
              </p>
              {watchItems.map((item) => (
                <li key={item} className="text-xs font-medium text-amber-900 dark:text-amber-200 flex gap-2">
                  <span className="text-amber-500">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className={labelClass}>Headline</label>
          <button
            type="button"
            onClick={() => void copyText("headline", headline)}
            disabled={!headline}
            className="text-slate-400 hover:text-brand-600 disabled:opacity-40"
          >
            {copiedField === "headline" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
        <input
          value={headline}
          onChange={(e) => setHeadline(e.target.value)}
          placeholder="Generate executive headline..."
          className={inputClass}
        />
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className={labelClass}>Executive summary</label>
          <button
            type="button"
            onClick={() => void copyText("summary", executiveSummary)}
            disabled={!executiveSummary}
            className="text-slate-400 hover:text-brand-600 disabled:opacity-40"
          >
            {copiedField === "summary" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
        <textarea
          value={executiveSummary}
          onChange={(e) => setExecutiveSummary(e.target.value)}
          rows={8}
          placeholder="Generate leadership narrative from report metrics..."
          className={inputClass}
        />
      </div>

      <div className="flex items-center justify-between gap-3">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Read-only — narrative only; does not change report data.
        </p>
        <button
          type="button"
          onClick={() => void copyAll()}
          disabled={!headline && !executiveSummary}
          className="px-4 py-2 rounded-xl text-[10px] font-bold border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 disabled:opacity-40 uppercase tracking-wider"
        >
          Copy all
        </button>
      </div>
    </div>
  );
}
