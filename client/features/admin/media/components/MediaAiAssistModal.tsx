"use client";

import type { MediaAssistResult } from "@/features/admin/ai/types/ai-studio";
import type { MediaItem } from "../type";
import { Check, Copy, Image as ImageIcon, Sparkles, X } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { isVisionEligible } from "../lib/buildMediaAssistContext";
import { MediaAiAssist } from "./MediaAiAssist";

const labelClass = "text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400";
const inputClass =
  "w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all text-sm";

interface MediaAiAssistModalProps {
  item: MediaItem;
  onClose: () => void;
}

export default function MediaAiAssistModal({ item, onClose }: MediaAiAssistModalProps) {
  const [useVision, setUseVision] = useState(isVisionEligible(item));
  const [contextHint, setContextHint] = useState("");
  const [altText, setAltText] = useState("");
  const [suggestedFilename, setSuggestedFilename] = useState("");
  const [visionUsed, setVisionUsed] = useState<boolean | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    setUseVision(isVisionEligible(item));
    setContextHint("");
    setAltText("");
    setSuggestedFilename(item.filename);
    setVisionUsed(null);
    setCopiedField(null);
  }, [item]);

  const applyResult = (result: MediaAssistResult) => {
    setAltText(result.altText);
    setSuggestedFilename(result.suggestedFilename);
    setVisionUsed(Boolean(result.visionUsed));
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
              <h3 className="font-bold text-slate-900 dark:text-white truncate">Media AI assist</h3>
              <p className="text-xs text-slate-500 truncate">{item.filename}</p>
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
          <div className="grid sm:grid-cols-[140px_1fr] gap-4 items-start">
            <div className="aspect-square rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.url} alt={item.filename} className="w-full h-full object-cover" />
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <ImageIcon className="w-4 h-4" />
                {item.mimetype || "unknown type"}
              </div>
              {isVisionEligible(item) && (
                <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useVision}
                    onChange={(e) => setUseVision(e.target.checked)}
                    className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                  />
                  Use vision model (OpenAI-compatible providers)
                </label>
              )}
              <input
                type="text"
                value={contextHint}
                onChange={(e) => setContextHint(e.target.value)}
                placeholder="Usage hint (optional), e.g. product gallery, homepage hero"
                className={inputClass}
              />
            </div>
          </div>

          <MediaAiAssist
            item={item}
            useVision={useVision}
            contextHint={contextHint}
            onApply={applyResult}
          />

          {visionUsed !== null && (
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {visionUsed ? "Vision analysis used" : "Generated from metadata only"}
            </p>
          )}

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className={labelClass}>Alt text</label>
              <button
                type="button"
                onClick={() => void copyText("alt", altText)}
                disabled={!altText}
                className="text-slate-400 hover:text-brand-600 disabled:opacity-40"
              >
                {copiedField === "alt" ? (
                  <Check className="w-3.5 h-3.5" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
            <input
              type="text"
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              placeholder="Descriptive alt text for accessibility..."
              className={inputClass}
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className={labelClass}>Suggested filename</label>
              <button
                type="button"
                onClick={() => void copyText("filename", suggestedFilename)}
                disabled={!suggestedFilename}
                className="text-slate-400 hover:text-brand-600 disabled:opacity-40"
              >
                {copiedField === "filename" ? (
                  <Check className="w-3.5 h-3.5" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
            <input
              type="text"
              value={suggestedFilename}
              onChange={(e) => setSuggestedFilename(e.target.value)}
              placeholder="seo-friendly-filename.jpg"
              className={`${inputClass} font-mono`}
            />
          </div>

          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Draft only — copy alt text and rename files manually when uploading or editing content.
          </p>
        </div>

        <div className="flex justify-end gap-3 p-6 border-t border-slate-100 dark:border-slate-800">
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
