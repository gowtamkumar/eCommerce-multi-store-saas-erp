"use client";

import { AiInlineBar } from "@/features/admin/ai/components/AiInlineBar";
import { useAiGenerate } from "@/features/admin/ai/hooks/useAiGenerate";
import type { RecruitmentJobCopyResult } from "@/features/admin/ai/types/ai-studio";
import type { JobFormData, RecruitmentDepartment } from "@/features/admin/hrm/hooks/useRecruitmentManager";
import {
  buildRecruitmentJobCopyPayload,
  buildRecruitmentJobSummary,
} from "@/features/admin/hrm/lib/buildRecruitmentJobCopyContext";
import { Check, Copy } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

interface RecruitmentJobCopyAiAssistProps {
  jobFormData: JobFormData;
  departments: RecruitmentDepartment[];
  onApply: (result: RecruitmentJobCopyResult) => void;
}

export default function RecruitmentJobCopyAiAssist({
  jobFormData,
  departments,
  onApply,
}: RecruitmentJobCopyAiAssistProps) {
  const { configured, loading, generateRecruitmentJobCopy } = useAiGenerate();
  const [screeningQuestions, setScreeningQuestions] = useState<string[]>([]);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const jobSummary = useMemo(
    () => buildRecruitmentJobSummary(jobFormData, departments),
    [jobFormData, departments],
  );

  useEffect(() => {
    setScreeningQuestions([]);
    setCopiedField(null);
  }, [jobSummary]);

  const hasContext = Boolean(jobFormData.title.trim() && jobFormData.departmentId);

  const handleGenerate = async () => {
    if (!hasContext) {
      toast.error("Enter a position title and department first");
      return;
    }

    try {
      const existingDraft = [jobFormData.description, jobFormData.requirements]
        .filter(Boolean)
        .join("\n\n");
      const result = await generateRecruitmentJobCopy(
        buildRecruitmentJobCopyPayload(jobSummary, existingDraft),
      );
      if (!result) return;

      onApply(result);
      setScreeningQuestions(result.screeningQuestions || []);
      toast.success("Job copy generated — review before publishing");
    } catch {
      toast.error("Failed to generate recruitment job copy");
    }
  };

  const copyQuestions = async () => {
    if (!screeningQuestions.length) return;
    try {
      await navigator.clipboard.writeText(
        screeningQuestions.map((question, index) => `${index + 1}. ${question}`).join("\n"),
      );
      setCopiedField("questions");
      toast.success("Screening questions copied");
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  return (
    <div className="rounded-2xl border border-brand-100 dark:border-brand-900/40 bg-brand-50/40 dark:bg-brand-950/20 p-4 space-y-4">
      <AiInlineBar
        title="AI job copy"
        hint="Generate job description, requirements, and screening questions"
        configured={configured}
        loading={loading}
        disabled={!hasContext}
        onGenerate={handleGenerate}
      />

      {screeningQuestions.length > 0 && (
        <div className="rounded-2xl bg-white/70 dark:bg-slate-900/50 border border-brand-100 dark:border-brand-900/30 p-4 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[10px] font-black uppercase tracking-widest text-brand-700 dark:text-brand-300">
              Screening questions (copy only)
            </p>
            <button
              type="button"
              onClick={() => void copyQuestions()}
              className="text-slate-400 hover:text-brand-600"
            >
              {copiedField === "questions" ? (
                <Check className="w-3.5 h-3.5" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
          <ol className="space-y-2 list-decimal list-inside">
            {screeningQuestions.map((question) => (
              <li key={question} className="text-xs font-medium text-slate-700 dark:text-slate-200">
                {question}
              </li>
            ))}
          </ol>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Not saved to the job posting — use during applicant screening.
          </p>
        </div>
      )}
    </div>
  );
}
