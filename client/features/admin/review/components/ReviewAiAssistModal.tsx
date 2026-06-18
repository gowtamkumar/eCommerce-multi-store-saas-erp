"use client";

import type { ReviewAssistResult, ToxicityLevel } from "@/features/admin/ai/types/ai-studio";
import type { AdminReview } from "../types";
import { getReviewerName } from "../utils/reviewHelpers";
import { AlertTriangle, Check, Copy, ShieldAlert, Sparkles, Star, X } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { ReviewAiAssist } from "./ReviewAiAssist";

const labelClass = "text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400";
const inputClass =
  "w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all text-sm resize-y";

const TOXICITY_STYLES: Record<ToxicityLevel, string> = {
  none: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  low: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
  medium: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  high: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
};

interface ReviewAiAssistModalProps {
  review: AdminReview;
  onClose: () => void;
}

export default function ReviewAiAssistModal({ review, onClose }: ReviewAiAssistModalProps) {
  const [publicReply, setPublicReply] = useState("");
  const [toxicityLevel, setToxicityLevel] = useState<ToxicityLevel>("none");
  const [toxicityReason, setToxicityReason] = useState("");
  const [needsAttention, setNeedsAttention] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setPublicReply("");
    setToxicityLevel("none");
    setToxicityReason("");
    setNeedsAttention(false);
    setCopied(false);
  }, [review]);

  const applyResult = (result: ReviewAssistResult) => {
    setPublicReply(result.publicReply);
    setToxicityLevel(result.toxicityLevel);
    setToxicityReason(result.toxicityReason);
    setNeedsAttention(result.needsAttention);
  };

  const copyReply = async () => {
    if (!publicReply) return;
    try {
      await navigator.clipboard.writeText(publicReply);
      setCopied(true);
      toast.success("Reply copied to clipboard");
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
              <h3 className="font-bold text-slate-900 dark:text-white truncate">Review moderation assist</h3>
              <p className="text-xs text-slate-500 truncate">
                {getReviewerName(review)} · {review.product?.name ?? "Product review"}
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
          <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 p-4 space-y-2">
            <div className="flex items-center gap-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3.5 h-3.5 ${i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-slate-300"}`}
                  />
                ))}
              </div>
              <span className="text-xs font-bold text-slate-500 uppercase">{review.status}</span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300 italic">"{review.comment}"</p>
          </div>

          <ReviewAiAssist review={review} onApply={applyResult} />

          {(toxicityLevel !== "none" || toxicityReason) && (
            <div className="space-y-2">
              <label className={labelClass}>Toxicity flag</label>
              <div className="flex flex-wrap items-center gap-2">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${TOXICITY_STYLES[toxicityLevel]}`}>
                  {(toxicityLevel === "medium" || toxicityLevel === "high") ? (
                    <ShieldAlert className="w-3.5 h-3.5" />
                  ) : (
                    <AlertTriangle className="w-3.5 h-3.5" />
                  )}
                  {toxicityLevel}
                </span>
                {needsAttention && (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-300 border border-rose-100 dark:border-rose-900/30">
                    Needs attention
                  </span>
                )}
              </div>
              {toxicityReason && (
                <p className="text-sm text-slate-600 dark:text-slate-400">{toxicityReason}</p>
              )}
            </div>
          )}

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className={labelClass}>Public reply draft</label>
              <button
                type="button"
                onClick={() => void copyReply()}
                disabled={!publicReply}
                className="text-slate-400 hover:text-brand-600 disabled:opacity-40"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <textarea
              value={publicReply}
              onChange={(e) => setPublicReply(e.target.value)}
              rows={6}
              placeholder="Draft a public store reply..."
              className={inputClass}
            />
          </div>

          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Draft only — you approve, reject, or delete manually. AI does not publish replies.
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
