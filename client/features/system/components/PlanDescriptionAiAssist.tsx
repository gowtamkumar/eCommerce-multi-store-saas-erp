"use client";

import { usePlatformAiConfig } from "../hooks/usePlatformAiConfig";
import type { PlanDescriptionInput } from "../hooks/usePlatformAi";
import { usePlatformAi } from "../hooks/usePlatformAi";
import { Loader2, Sparkles } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

interface PlanDescriptionAiAssistProps {
  input: PlanDescriptionInput;
  onApply: (description: string) => void;
}

export function PlanDescriptionAiAssist({ input, onApply }: PlanDescriptionAiAssistProps) {
  const { configured } = usePlatformAiConfig();
  const { loading, generatePlanDescription } = usePlatformAi();

  if (configured === null) return null;

  const handleGenerate = async () => {
    if (!input.planName.trim()) {
      toast.error("Enter a tier name first");
      return;
    }

    const result = await generatePlanDescription({
      ...input,
      planName: input.planName.trim(),
    });

    if (!result?.description) return;

    onApply(result.description);
    toast.success("AI plan description applied");
  };

  return (
    <div className="rounded-2xl border border-brand-200/60 dark:border-brand-900/40 bg-gradient-to-r from-brand-50/80 to-violet-50/50 dark:from-brand-950/30 dark:to-violet-950/20 p-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <Sparkles className="w-4 h-4 text-brand-600 shrink-0" />
          <div>
            <p className="font-bold text-slate-900 dark:text-white text-sm">AI plan description</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Generate pricing-page marketing copy from tier name, price, and entitlements
            </p>
          </div>
        </div>

        {configured ? (
          <button
            type="button"
            onClick={handleGenerate}
            disabled={loading || !input.planName.trim()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-bold rounded-xl disabled:opacity-50 whitespace-nowrap sm:ml-auto"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            Generate
          </button>
        ) : (
          <p className="text-xs text-amber-800 dark:text-amber-200 sm:ml-auto max-w-sm">
            <Link href="/system/settings?tab=ai" className="font-bold underline">
              Configure Platform AI
            </Link>{" "}
            under Platform Settings to enable generation.
          </p>
        )}
      </div>
    </div>
  );
}
