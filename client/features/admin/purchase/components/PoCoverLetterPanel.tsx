"use client";

import { AiInlineBar } from "@/features/admin/ai/components/AiInlineBar";
import { useAiGenerate } from "@/features/admin/ai/hooks/useAiGenerate";
import { Check, Copy } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { buildPoCoverLetterPayload } from "../lib/buildPoCoverLetterContext";

const labelClass = "text-[10px] font-black uppercase tracking-widest text-slate-400";
const inputClass =
  "w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all text-sm resize-y";

interface PoCoverLetterPanelProps {
  purchaseOrderSummary: string;
  existingCoverLetter?: string;
  disabled?: boolean;
  variant?: "light" | "dark";
}

export default function PoCoverLetterPanel({
  purchaseOrderSummary,
  existingCoverLetter,
  disabled,
  variant = "light",
}: PoCoverLetterPanelProps) {
  const { configured, loading, generatePoCoverLetter } = useAiGenerate();
  const [coverLetter, setCoverLetter] = useState("");
  const [termsNotes, setTermsNotes] = useState("");
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    setCoverLetter("");
    setTermsNotes("");
    setCopiedField(null);
  }, [purchaseOrderSummary]);

  const handleGenerate = async () => {
    try {
      const result = await generatePoCoverLetter(
        buildPoCoverLetterPayload(purchaseOrderSummary, existingCoverLetter || coverLetter),
      );
      if (!result) return;

      setCoverLetter(result.coverLetter);
      setTermsNotes(result.termsNotes);
      toast.success("PO cover letter generated — review before sending");
    } catch {
      toast.error("Failed to generate PO cover letter");
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
    const combined = [coverLetter, "", termsNotes ? `Terms:\n${termsNotes}` : ""]
      .filter(Boolean)
      .join("\n");
    await copyText("all", combined);
  };

  const shellClass =
    variant === "dark"
      ? "bg-slate-900 text-slate-300 rounded-3xl p-6 space-y-4 border border-slate-800"
      : "bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 p-6 space-y-4 shadow-sm";

  return (
    <div className={shellClass}>
      <AiInlineBar
        title="AI PO cover letter"
        hint="Draft supplier cover letter and internal terms from PO context"
        configured={configured}
        loading={loading}
        disabled={disabled}
        onGenerate={handleGenerate}
      />

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className={labelClass}>Cover letter</label>
          <button
            type="button"
            onClick={() => void copyText("letter", coverLetter)}
            disabled={!coverLetter}
            className="text-slate-400 hover:text-brand-600 disabled:opacity-40"
          >
            {copiedField === "letter" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
        <textarea
          value={coverLetter}
          onChange={(e) => setCoverLetter(e.target.value)}
          rows={7}
          placeholder="Generate formal PO cover letter for supplier..."
          className={inputClass}
        />
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className={labelClass}>Terms notes (internal)</label>
          <button
            type="button"
            onClick={() => void copyText("terms", termsNotes)}
            disabled={!termsNotes}
            className="text-slate-400 hover:text-brand-600 disabled:opacity-40"
          >
            {copiedField === "terms" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
        <textarea
          value={termsNotes}
          onChange={(e) => setTermsNotes(e.target.value)}
          rows={4}
          placeholder="Internal delivery and payment reminders..."
          className={inputClass}
        />
      </div>

      <div className="flex items-center justify-between gap-3">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Draft only — not saved to the purchase order.
        </p>
        <button
          type="button"
          onClick={() => void copyAll()}
          disabled={!coverLetter && !termsNotes}
          className="px-4 py-2 rounded-xl text-[10px] font-bold border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 disabled:opacity-40 uppercase tracking-wider"
        >
          Copy all
        </button>
      </div>
    </div>
  );
}
