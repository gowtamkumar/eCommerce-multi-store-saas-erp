"use client";

import { AiInlineBar } from "@/features/admin/ai/components/AiInlineBar";
import { useAiGenerate } from "@/features/admin/ai/hooks/useAiGenerate";
import { Check, Copy } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import type { RFQ } from "../types";
import { gatherRfqSupplierEmailContext } from "../lib/gatherRfqSupplierEmailContext";

const labelClass = "text-[10px] font-black uppercase tracking-widest text-slate-400";
const inputClass =
  "w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all text-sm resize-y";

function stripHtml(html: string) {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<p>/gi, "")
    .replace(/<[^>]+>/g, "")
    .trim();
}

interface RfqSupplierEmailPanelProps {
  rfq: RFQ;
}

export default function RfqSupplierEmailPanel({ rfq }: RfqSupplierEmailPanelProps) {
  const { configured, loading, generateCampaignCopy } = useAiGenerate();
  const [supplierHint, setSupplierHint] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    setSupplierHint("");
    setEmailSubject("");
    setEmailBody("");
    setCopiedField(null);
  }, [rfq.id]);

  const handleGenerate = async () => {
    try {
      const payload = await gatherRfqSupplierEmailContext(rfq, supplierHint);
      const result = await generateCampaignCopy(payload);
      if (!result) return;

      setEmailSubject(result.emailSubject || "");
      setEmailBody(stripHtml(result.emailBody || ""));
      toast.success("Supplier email draft generated — review before sending");
    } catch {
      toast.error("Failed to generate supplier email");
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
    const combined = [`Subject: ${emailSubject}`, "", emailBody].filter(Boolean).join("\n");
    await copyText("all", combined);
  };

  return (
    <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/40 p-4 space-y-4">
      <AiInlineBar
        title="AI supplier email"
        hint="Draft RFQ invitation email via campaign-copy (subject + body)"
        configured={configured}
        loading={loading}
        disabled={rfq.status !== "OPEN"}
        onGenerate={handleGenerate}
      >
        <input
          type="text"
          value={supplierHint}
          onChange={(e) => setSupplierHint(e.target.value)}
          disabled={loading}
          placeholder="Supplier name or segment (optional)"
          className="flex-1 min-w-[140px] px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm outline-none"
        />
      </AiInlineBar>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className={labelClass}>Email subject</label>
          <button
            type="button"
            onClick={() => void copyText("subject", emailSubject)}
            disabled={!emailSubject}
            className="text-slate-400 hover:text-brand-600 disabled:opacity-40"
          >
            {copiedField === "subject" ? (
              <Check className="w-3.5 h-3.5" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
        <input
          type="text"
          value={emailSubject}
          onChange={(e) => setEmailSubject(e.target.value)}
          placeholder="Generate supplier RFQ invitation subject..."
          className={inputClass}
        />
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className={labelClass}>Email body</label>
          <button
            type="button"
            onClick={() => void copyText("body", emailBody)}
            disabled={!emailBody}
            className="text-slate-400 hover:text-brand-600 disabled:opacity-40"
          >
            {copiedField === "body" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
        <textarea
          value={emailBody}
          onChange={(e) => setEmailBody(e.target.value)}
          rows={8}
          placeholder="Generate supplier RFQ invitation body..."
          className={inputClass}
        />
      </div>

      <div className="flex items-center justify-between gap-3">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Draft only — admin sends email manually.
        </p>
        <button
          type="button"
          onClick={() => void copyAll()}
          disabled={!emailSubject && !emailBody}
          className="px-4 py-2 rounded-xl text-[10px] font-bold border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-900 disabled:opacity-40 uppercase tracking-wider"
        >
          Copy all
        </button>
      </div>
    </div>
  );
}
