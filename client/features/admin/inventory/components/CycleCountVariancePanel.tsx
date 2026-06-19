"use client";

import { AiInlineBar } from "@/features/admin/ai/components/AiInlineBar";
import { useAiGenerate } from "@/features/admin/ai/hooks/useAiGenerate";
import type { CycleCountVarianceResult } from "@/features/admin/ai/types/ai-studio";
import { AlertCircle, Check, Copy, Sparkles } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import type { CountLine } from "../hooks/useCycleCount";
import { gatherCycleCountVarianceContext } from "../lib/gatherCycleCountVarianceContext";

interface CycleCountVariancePanelProps {
  warehouses: Array<{ id: string; name: string; code?: string }>;
  warehouseId: string;
  countRef: string;
  lines: CountLine[];
  disabled?: boolean;
}

export default function CycleCountVariancePanel({
  warehouses,
  warehouseId,
  countRef,
  lines,
  disabled,
}: CycleCountVariancePanelProps) {
  const { configured, loading, generateCycleCountVariance } = useAiGenerate();
  const [result, setResult] = useState<CycleCountVarianceResult | null>(null);
  const [copied, setCopied] = useState(false);

  const hasLoadedLines = lines.some((line) => line.liveStock !== null);
  const hasVariances = lines.some((line) => line.delta !== null && line.delta !== 0);

  const handleGenerate = async () => {
    try {
      const context = await gatherCycleCountVarianceContext(
        warehouses,
        warehouseId,
        countRef,
        lines,
      );
      const data = await generateCycleCountVariance(context);
      if (!data) return;

      setResult(data);
      toast.success("Variance explanation generated — read-only summary");
    } catch {
      toast.error("Failed to generate cycle count variance explanation");
    }
  };

  const copyNarrative = async () => {
    if (!result?.narrative) return;
    try {
      const highlights =
        result.varianceHighlights?.length > 0
          ? `\n\nHighlights:\n${result.varianceHighlights.map((h) => `• ${h}`).join("\n")}`
          : "";
      await navigator.clipboard.writeText(`${result.narrative}${highlights}`);
      setCopied(true);
      toast.success("Copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200/50 dark:border-slate-800 overflow-hidden shadow-sm">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 px-6 py-5 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-brand-50 dark:bg-brand-950/30 text-brand-600">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">Variance explanation</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Read-only narrative from count lines, deltas, and recent warehouse activity
            </p>
          </div>
        </div>
        <span className="inline-flex items-center self-start lg:self-auto px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-slate-100 dark:bg-slate-800 text-slate-500">
          No ledger changes
        </span>
      </div>

      <div className="p-6 space-y-5">
        <AiInlineBar
          title="Explain count variances"
          hint={
            hasVariances
              ? "Summarize discrepancy patterns and likely causes before reconciling"
              : "Analyze loaded count lines for variance patterns and audit context"
          }
          configured={configured}
          loading={loading}
          disabled={disabled || !warehouseId || lines.length === 0 || !hasLoadedLines}
          onGenerate={handleGenerate}
        />

        {result?.varianceHighlights && result.varianceHighlights.length > 0 ? (
          <div className="space-y-2">
            <p className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
              Highlights
            </p>
            <ul className="space-y-2">
              {result.varianceHighlights.map((highlight, index) => (
                <li
                  key={`${index}-${highlight.slice(0, 24)}`}
                  className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-200"
                >
                  <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <span>{highlight}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {result?.narrative ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                Narrative
              </p>
              <button
                type="button"
                onClick={() => void copyNarrative()}
                className="text-slate-400 hover:text-brand-600"
                title="Copy narrative"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-950/40 p-4 text-sm leading-relaxed text-slate-800 dark:text-slate-100 whitespace-pre-wrap">
              {result.narrative}
            </div>
          </div>
        ) : null}

        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Read-only insights — does not submit the count or post adjustments.
        </p>
      </div>
    </div>
  );
}
