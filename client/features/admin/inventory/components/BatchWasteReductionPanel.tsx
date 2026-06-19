"use client";

import { AiInlineBar } from "@/features/admin/ai/components/AiInlineBar";
import { useAiGenerate } from "@/features/admin/ai/hooks/useAiGenerate";
import type { BatchWasteReductionResult } from "@/features/admin/ai/types/ai-studio";
import { AlertCircle, Check, Copy, Sparkles } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import type { ProductBatch } from "../hooks/useBatchRegistry";
import type { BatchRegistryStats } from "../lib/buildBatchWasteReductionContext";
import { gatherBatchWasteReductionContext } from "../lib/gatherBatchWasteReductionContext";

interface BatchWasteReductionPanelProps {
  batches: ProductBatch[];
  stats: BatchRegistryStats;
  totalItems: number;
  statusFilter: string;
  expiringSoonFilter: boolean;
  disabled?: boolean;
}

export default function BatchWasteReductionPanel({
  batches,
  stats,
  totalItems,
  statusFilter,
  expiringSoonFilter,
  disabled,
}: BatchWasteReductionPanelProps) {
  const { configured, loading, generateBatchWasteReduction } = useAiGenerate();
  const [result, setResult] = useState<BatchWasteReductionResult | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    try {
      const context = await gatherBatchWasteReductionContext(
        batches,
        stats,
        totalItems,
        statusFilter,
        expiringSoonFilter,
      );
      const data = await generateBatchWasteReduction(context);
      if (!data) return;

      setResult(data);
      toast.success("Waste reduction tips generated — read-only guidance");
    } catch {
      toast.error("Failed to generate waste reduction tips");
    }
  };

  const copyTips = async () => {
    if (!result?.wasteReductionTips) return;
    try {
      const actions =
        result.priorityActions?.length > 0
          ? `\n\nPriority actions:\n${result.priorityActions.map((a) => `• ${a}`).join("\n")}`
          : "";
      await navigator.clipboard.writeText(`${result.wasteReductionTips}${actions}`);
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
            <h3 className="text-lg font-black text-slate-900 dark:text-white">Waste reduction tips</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Read-only FEFO and near-expiry guidance — heuristic forecasting tie-in, no auto changes
            </p>
          </div>
        </div>
        <span className="inline-flex items-center self-start lg:self-auto px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-slate-100 dark:bg-slate-800 text-slate-500">
          No batch writes
        </span>
      </div>

      <div className="p-6 space-y-5">
        <AiInlineBar
          title="Suggest waste reduction actions"
          hint="FEFO picking, promo timing, and expiry risk from live batch registry"
          configured={configured}
          loading={loading}
          disabled={disabled || totalItems === 0}
          onGenerate={handleGenerate}
        />

        {result?.priorityActions && result.priorityActions.length > 0 ? (
          <div className="space-y-2">
            <p className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
              Priority actions
            </p>
            <ul className="space-y-2">
              {result.priorityActions.map((action, index) => (
                <li
                  key={`${index}-${action.slice(0, 24)}`}
                  className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-200"
                >
                  <AlertCircle className="w-4 h-4 text-violet-500 shrink-0 mt-0.5" />
                  <span>{action}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {result?.wasteReductionTips ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                Tips
              </p>
              <button
                type="button"
                onClick={() => void copyTips()}
                className="text-slate-400 hover:text-brand-600"
                title="Copy tips"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-950/40 p-4 text-sm leading-relaxed text-slate-800 dark:text-slate-100 whitespace-pre-wrap">
              {result.wasteReductionTips}
            </div>
          </div>
        ) : null}

        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Read-only insights — does not modify batches, sweep expired stock, or post ledger entries.
        </p>
      </div>
    </div>
  );
}
