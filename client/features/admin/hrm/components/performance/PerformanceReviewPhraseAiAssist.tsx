"use client";

import { AiInlineBar } from "@/features/admin/ai/components/AiInlineBar";
import { useAiGenerate } from "@/features/admin/ai/hooks/useAiGenerate";
import type { PerformanceReviewPhrasesResult } from "@/features/admin/ai/types/ai-studio";
import type {
  PerformanceEmployee,
  PerformanceReviewForm,
} from "@/features/admin/hrm/hooks/usePerformanceManager";
import {
  buildPerformanceReviewPhrasesPayload,
  buildPerformanceReviewSummary,
  type PerformanceReviewFocus,
} from "@/features/admin/hrm/lib/buildPerformanceReviewPhraseContext";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

interface PerformanceReviewPhraseAiAssistProps {
  reviewForm: PerformanceReviewForm;
  employees: PerformanceEmployee[];
  onInsertPhrase: (phrase: string) => void;
}

function PhraseSection({
  title,
  phrases,
  toneClass,
  onInsert,
}: {
  title: string;
  phrases: string[];
  toneClass: string;
  onInsert: (phrase: string) => void;
}) {
  if (!phrases.length) return null;

  return (
    <div className={`rounded-2xl border p-4 space-y-2 ${toneClass}`}>
      <p className="text-[10px] font-black uppercase tracking-widest">{title}</p>
      <ul className="space-y-2">
        {phrases.map((phrase) => (
          <li key={phrase}>
            <button
              type="button"
              onClick={() => onInsert(phrase)}
              className="w-full text-left text-xs font-medium leading-relaxed hover:underline"
            >
              {phrase}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function PerformanceReviewPhraseAiAssist({
  reviewForm,
  employees,
  onInsertPhrase,
}: PerformanceReviewPhraseAiAssistProps) {
  const { configured, loading, generatePerformanceReviewPhrases } = useAiGenerate();
  const [focus, setFocus] = useState<PerformanceReviewFocus>("balanced");
  const [phrases, setPhrases] = useState<PerformanceReviewPhrasesResult | null>(null);

  const reviewSummary = useMemo(
    () => buildPerformanceReviewSummary(reviewForm, employees),
    [reviewForm, employees],
  );

  useEffect(() => {
    setPhrases(null);
  }, [reviewSummary, focus]);

  const hasContext = Boolean(reviewForm.employeeId && reviewForm.reviewPeriod.trim());

  const handleGenerate = async () => {
    if (!hasContext) {
      toast.error("Select an employee and review period first");
      return;
    }

    try {
      const result = await generatePerformanceReviewPhrases(
        buildPerformanceReviewPhrasesPayload(reviewSummary, focus, reviewForm.comments),
      );
      if (!result) return;

      setPhrases(result);
      toast.success("Phrase bank generated — personalize before submitting");
    } catch {
      toast.error("Failed to generate review phrase bank");
    }
  };

  const insertPhrase = (phrase: string) => {
    onInsertPhrase(phrase);
    toast.success("Phrase inserted into comments");
  };

  return (
    <div className="rounded-2xl border border-brand-100 dark:border-brand-900/40 bg-brand-50/40 dark:bg-brand-950/20 p-4 space-y-4">
      <AiInlineBar
        title="AI phrase bank"
        hint="Sensitive — no names sent; draft phrases only"
        configured={configured}
        loading={loading}
        disabled={!hasContext}
        onGenerate={handleGenerate}
      >
        <select
          value={focus}
          onChange={(e) => setFocus(e.target.value as PerformanceReviewFocus)}
          disabled={loading}
          className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm outline-none"
        >
          <option value="balanced">Balanced</option>
          <option value="strengths">Strengths focus</option>
          <option value="development">Development focus</option>
        </select>
      </AiInlineBar>

      {phrases && (
        <div className="space-y-3">
          <PhraseSection
            title="Strengths"
            phrases={phrases.strengthsPhrases}
            toneClass="bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/30 text-emerald-900 dark:text-emerald-200"
            onInsert={insertPhrase}
          />
          <PhraseSection
            title="Development areas"
            phrases={phrases.developmentPhrases}
            toneClass="bg-amber-50/70 dark:bg-amber-950/20 border-amber-100 dark:border-amber-900/30 text-amber-900 dark:text-amber-200"
            onInsert={insertPhrase}
          />
          <PhraseSection
            title="Summary closers"
            phrases={phrases.summaryPhrases}
            toneClass="bg-indigo-50/70 dark:bg-indigo-950/20 border-indigo-100 dark:border-indigo-900/30 text-indigo-900 dark:text-indigo-200"
            onInsert={insertPhrase}
          />
          {phrases.usageNotes.length > 0 && (
            <ul className="text-[10px] font-bold uppercase tracking-wider text-slate-400 space-y-1">
              {phrases.usageNotes.map((note) => (
                <li key={note}>• {note}</li>
              ))}
            </ul>
          )}
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Click a phrase to insert into comments — review and edit before submit.
          </p>
        </div>
      )}
    </div>
  );
}
