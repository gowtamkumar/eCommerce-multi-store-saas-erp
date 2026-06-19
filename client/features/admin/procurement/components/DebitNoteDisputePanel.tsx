"use client";

import { AiInlineBar } from "@/features/admin/ai/components/AiInlineBar";
import { useAiGenerate } from "@/features/admin/ai/hooks/useAiGenerate";
import { Check, Copy } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { buildDebitNoteDisputePayload } from "../lib/buildDebitNoteDisputeContext";

const labelClass = "text-[10px] font-black uppercase tracking-widest text-slate-400";
const inputClass =
  "w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all text-sm resize-y";

interface DebitNoteDisputePanelProps {
  debitNoteSummary: string;
  existingDisputeLetter?: string;
  disabled?: boolean;
  onApplyReason?: (reason: string) => void;
}

export default function DebitNoteDisputePanel({
  debitNoteSummary,
  existingDisputeLetter,
  disabled,
  onApplyReason,
}: DebitNoteDisputePanelProps) {
  const { configured, loading, generateDebitNoteDispute } = useAiGenerate();
  const [disputeLetter, setDisputeLetter] = useState("");
  const [internalNotes, setInternalNotes] = useState("");
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    setDisputeLetter("");
    setInternalNotes("");
    setCopiedField(null);
  }, [debitNoteSummary]);

  const handleGenerate = async () => {
    try {
      const result = await generateDebitNoteDispute(
        buildDebitNoteDisputePayload(debitNoteSummary, existingDisputeLetter || disputeLetter),
      );
      if (!result) return;

      setDisputeLetter(result.disputeLetter);
      setInternalNotes(result.internalNotes);
      toast.success("Dispute letter generated — review before sending");
    } catch {
      toast.error("Failed to generate dispute letter");
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
    const combined = [disputeLetter, internalNotes ? `\n\nInternal notes:\n${internalNotes}` : ""]
      .filter(Boolean)
      .join("");
    await copyText("all", combined);
  };

  const applyReasonFromInternalNotes = () => {
    if (!internalNotes.trim() || !onApplyReason) return;
    const firstLine = internalNotes
      .split("\n")
      .map((line) => line.replace(/^[-•*]\s*/, "").trim())
      .find(Boolean);
    if (!firstLine) return;
    onApplyReason(firstLine.slice(0, 500));
    toast.success("Suggested reason applied — review before saving");
  };

  return (
    <div className="rounded-3xl border border-indigo-100 dark:border-indigo-900/40 bg-indigo-50/50 dark:bg-indigo-950/20 p-5 space-y-4">
      <AiInlineBar
        title="AI dispute letter"
        hint="Draft supplier dispute letter and internal AP notes from debit note context"
        configured={configured}
        loading={loading}
        disabled={disabled}
        onGenerate={handleGenerate}
      />

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className={labelClass}>Dispute letter (supplier)</label>
          <button
            type="button"
            onClick={() => void copyText("letter", disputeLetter)}
            disabled={!disputeLetter}
            className="text-slate-400 hover:text-brand-600 disabled:opacity-40"
          >
            {copiedField === "letter" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
        <textarea
          value={disputeLetter}
          onChange={(e) => setDisputeLetter(e.target.value)}
          rows={7}
          placeholder="Generate formal supplier dispute letter..."
          className={inputClass}
        />
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className={labelClass}>Internal notes</label>
          <div className="flex items-center gap-2">
            {onApplyReason && internalNotes && (
              <button
                type="button"
                onClick={applyReasonFromInternalNotes}
                className="text-[10px] font-black uppercase tracking-wider text-indigo-600 hover:text-indigo-700"
              >
                Use as reason hint
              </button>
            )}
            <button
              type="button"
              onClick={() => void copyText("notes", internalNotes)}
              disabled={!internalNotes}
              className="text-slate-400 hover:text-brand-600 disabled:opacity-40"
            >
              {copiedField === "notes" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
        <textarea
          value={internalNotes}
          onChange={(e) => setInternalNotes(e.target.value)}
          rows={4}
          placeholder="Internal AP follow-up reminders..."
          className={inputClass}
        />
      </div>

      <div className="flex items-center justify-between gap-3">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Draft only — not saved to the debit note record.
        </p>
        <button
          type="button"
          onClick={() => void copyAll()}
          disabled={!disputeLetter && !internalNotes}
          className="px-4 py-2 rounded-xl text-[10px] font-bold border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 disabled:opacity-40 uppercase tracking-wider"
        >
          Copy all
        </button>
      </div>
    </div>
  );
}
