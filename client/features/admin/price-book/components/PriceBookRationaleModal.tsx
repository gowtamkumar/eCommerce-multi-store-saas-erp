"use client";

import type { PriceBookRationaleResult } from "@/features/admin/ai/types/ai-studio";
import type { PriceBook } from "../types";
import { Check, Copy, Scale, Sparkles, X } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { PriceBookRationaleAiAssist } from "./PriceBookRationaleAiAssist";

const labelClass = "text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400";
const inputClass =
  "w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all text-sm resize-y";

interface PriceBookRationaleModalProps {
  book: PriceBook;
  allBooks: PriceBook[];
  onClose: () => void;
}

export default function PriceBookRationaleModal({
  book,
  allBooks,
  onClose,
}: PriceBookRationaleModalProps) {
  const [rationaleNotes, setRationaleNotes] = useState("");
  const [usageGuidance, setUsageGuidance] = useState("");
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    setRationaleNotes("");
    setUsageGuidance("");
    setCopiedField(null);
  }, [book]);

  const applyResult = (result: PriceBookRationaleResult) => {
    setRationaleNotes(result.rationaleNotes);
    setUsageGuidance(result.usageGuidance);
  };

  const copyText = async (field: string, text: string) => {
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
    const combined = [usageGuidance, "", rationaleNotes].filter(Boolean).join("\n");
    await copyText("all", combined);
  };

  return (
    <div className="fixed inset-0 z-70 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800 max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950/20 flex items-center justify-center text-brand-600 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-slate-900 dark:text-white truncate">Pricing rationale</h3>
              <p className="text-xs text-slate-500 truncate">
                {book.name} · {book.code}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 p-4 flex items-center gap-3">
            <Scale className="w-5 h-5 text-brand-600 shrink-0" />
            <div className="text-sm text-slate-600 dark:text-slate-300">
              <span className="font-bold text-slate-900 dark:text-white">{book.type}</span>
              {" · "}
              {book.currency}
              {" · "}
              {book.isActive ? "Active" : "Inactive"}
            </div>
          </div>

          <PriceBookRationaleAiAssist book={book} allBooks={allBooks} onApply={applyResult} />

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className={labelClass}>Usage guidance</label>
              <button
                type="button"
                onClick={() => void copyText("usage", usageGuidance)}
                disabled={!usageGuidance}
                className="text-slate-400 hover:text-brand-600 disabled:opacity-40"
              >
                {copiedField === "usage" ? (
                  <Check className="w-3.5 h-3.5" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
            <textarea
              value={usageGuidance}
              onChange={(e) => setUsageGuidance(e.target.value)}
              rows={3}
              placeholder="When should this price book be applied?"
              className={inputClass}
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className={labelClass}>Rationale notes</label>
              <button
                type="button"
                onClick={() => void copyText("notes", rationaleNotes)}
                disabled={!rationaleNotes}
                className="text-slate-400 hover:text-brand-600 disabled:opacity-40"
              >
                {copiedField === "notes" ? (
                  <Check className="w-3.5 h-3.5" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
            <textarea
              value={rationaleNotes}
              onChange={(e) => setRationaleNotes(e.target.value)}
              rows={9}
              placeholder="Internal pricing rationale for your team..."
              className={inputClass}
            />
          </div>

          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Internal notes only — not saved to the price book record.
          </p>
        </div>

        <div className="flex justify-end gap-3 p-6 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={() => void copyAll()}
            disabled={!rationaleNotes && !usageGuidance}
            className="px-5 py-2.5 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all uppercase tracking-wider disabled:opacity-40"
          >
            Copy all
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-700 text-white transition-all uppercase tracking-wider"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
