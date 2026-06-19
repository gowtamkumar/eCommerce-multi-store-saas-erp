"use client";

import { AiInlineBar } from "@/features/admin/ai/components/AiInlineBar";
import { useAiGenerate } from "@/features/admin/ai/hooks/useAiGenerate";
import { BookOpen, Check, Copy, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { buildTaxRuleExplanationPayload } from "../lib/buildTaxRuleExplanationContext";

const labelClass = "text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400";
const inputClass =
  "w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all text-sm resize-y";

export interface TaxRuleExplanationModalProps {
  title: string;
  subtitle: string;
  ruleSummary: string;
  relatedRulesSummary?: string;
  onClose: () => void;
}

export default function TaxRuleExplanationModal({
  title,
  subtitle,
  ruleSummary,
  relatedRulesSummary,
  onClose,
}: TaxRuleExplanationModalProps) {
  const { configured, loading, generateTaxRuleExplanation } = useAiGenerate();
  const [ruleTitle, setRuleTitle] = useState("");
  const [explanation, setExplanation] = useState("");
  const [applicabilityNotes, setApplicabilityNotes] = useState<string[]>([]);
  const [complianceReminders, setComplianceReminders] = useState<string[]>([]);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const contextKey = useMemo(
    () => `${ruleSummary}::${relatedRulesSummary || ""}`,
    [ruleSummary, relatedRulesSummary],
  );

  useEffect(() => {
    setRuleTitle("");
    setExplanation("");
    setApplicabilityNotes([]);
    setComplianceReminders([]);
    setCopiedField(null);
  }, [contextKey]);

  const handleGenerate = async () => {
    try {
      const existingDraft = [ruleTitle, explanation].filter(Boolean).join("\n\n");
      const result = await generateTaxRuleExplanation(
        buildTaxRuleExplanationPayload(ruleSummary, relatedRulesSummary, existingDraft),
      );
      if (!result) return;

      setRuleTitle(result.ruleTitle);
      setExplanation(result.explanation);
      setApplicabilityNotes(result.applicabilityNotes || []);
      setComplianceReminders(result.complianceReminders || []);
      toast.success("Rule explanation generated — documentation only");
    } catch {
      toast.error("Failed to generate tax rule explanation");
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
    const notes =
      applicabilityNotes.length > 0
        ? `\n\nApplicability:\n${applicabilityNotes.map((item) => `• ${item}`).join("\n")}`
        : "";
    const compliance =
      complianceReminders.length > 0
        ? `\n\nCompliance reminders:\n${complianceReminders.map((item) => `• ${item}`).join("\n")}`
        : "";
    await copyText("all", `${ruleTitle}\n\n${explanation}${notes}${compliance}`);
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-slate-900 dark:text-white truncate">{title}</h3>
              <p className="text-xs text-slate-500 truncate">{subtitle}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <AiInlineBar
            title="Generate rule explanation"
            hint="Documentation only — no tax calculation or rule changes"
            configured={configured}
            loading={loading}
            onGenerate={handleGenerate}
          />

          {(applicabilityNotes.length > 0 || complianceReminders.length > 0) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {applicabilityNotes.length > 0 && (
                <ul className="space-y-2 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30 p-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-indigo-700 dark:text-indigo-300">
                    Applicability
                  </p>
                  {applicabilityNotes.map((item) => (
                    <li key={item} className="text-xs font-medium text-indigo-900 dark:text-indigo-200 flex gap-2">
                      <span className="text-indigo-500">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              )}
              {complianceReminders.length > 0 && (
                <ul className="space-y-2 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 p-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-amber-700 dark:text-amber-300">
                    Compliance reminders
                  </p>
                  {complianceReminders.map((item) => (
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
              <label className={labelClass}>Rule title</label>
              <button
                type="button"
                onClick={() => void copyText("title", ruleTitle)}
                disabled={!ruleTitle}
                className="text-slate-400 hover:text-brand-600 disabled:opacity-40"
              >
                {copiedField === "title" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <input
              value={ruleTitle}
              onChange={(e) => setRuleTitle(e.target.value)}
              placeholder="Generate documentation title..."
              className={inputClass}
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className={labelClass}>Explanation</label>
              <button
                type="button"
                onClick={() => void copyText("explanation", explanation)}
                disabled={!explanation}
                className="text-slate-400 hover:text-brand-600 disabled:opacity-40"
              >
                {copiedField === "explanation" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <textarea
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              rows={8}
              placeholder="Generate internal rule documentation..."
              className={inputClass}
            />
          </div>

          <div className="flex items-center justify-between gap-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Docs only — not legal advice; does not calculate or modify tax rules.
            </p>
            <button
              type="button"
              onClick={() => void copyAll()}
              disabled={!ruleTitle && !explanation}
              className="px-4 py-2 rounded-xl text-[10px] font-bold border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 disabled:opacity-40 uppercase tracking-wider"
            >
              Copy all
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
