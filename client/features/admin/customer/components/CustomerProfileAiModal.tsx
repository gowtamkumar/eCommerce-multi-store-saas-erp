"use client";

import type { CustomerProfileResult } from "@/features/admin/ai/types/ai-studio";
import type { User } from "../type";
import { Check, Copy, Sparkles, X } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { CustomerProfileAiAssist } from "./CustomerProfileAiAssist";

const labelClass = "text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400";
const inputClass =
  "w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all text-sm resize-y";

interface CustomerProfileAiModalProps {
  user: User;
  onClose: () => void;
}

export default function CustomerProfileAiModal({ user, onClose }: CustomerProfileAiModalProps) {
  const [supportSummary, setSupportSummary] = useState("");
  const [segmentLabels, setSegmentLabels] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setSupportSummary("");
    setSegmentLabels([]);
    setCopied(false);
  }, [user]);

  const applyResult = (result: CustomerProfileResult) => {
    setSupportSummary(result.supportSummary);
    setSegmentLabels(result.segmentLabels ?? []);
  };

  const copySummary = async () => {
    if (!supportSummary) return;
    try {
      const labelLine = segmentLabels.length ? `\n\nSegments: ${segmentLabels.join(", ")}` : "";
      await navigator.clipboard.writeText(`${supportSummary}${labelLine}`);
      setCopied(true);
      toast.success("Copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
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
              <h3 className="font-bold text-slate-900 dark:text-white truncate">Customer AI insights</h3>
              <p className="text-xs text-slate-500 truncate">
                {user.name} · {user.email}
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
          <CustomerProfileAiAssist user={user} onApply={applyResult} />

          {segmentLabels.length > 0 && (
            <div className="space-y-2">
              <label className={labelClass}>Segment labels</label>
              <div className="flex flex-wrap gap-2">
                {segmentLabels.map((label) => (
                  <span
                    key={label}
                    className="px-3 py-1 rounded-full text-xs font-bold bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300"
                  >
                    {label}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className={labelClass}>Support summary</label>
              <button
                type="button"
                onClick={() => void copySummary()}
                disabled={!supportSummary}
                className="text-slate-400 hover:text-brand-600 disabled:opacity-40"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <textarea
              value={supportSummary}
              onChange={(e) => setSupportSummary(e.target.value)}
              rows={10}
              placeholder="Generate a read-only briefing for support and CRM teams..."
              className={inputClass}
            />
          </div>

          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Read-only insights — does not update customer profile or segments.
          </p>
        </div>

        <div className="flex justify-end gap-3 p-6 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all uppercase tracking-wider"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
