"use client";

import { Copy, Loader2, Megaphone, Sparkles } from "lucide-react";
import { FormEvent, useState } from "react";
import toast from "react-hot-toast";
import type { CampaignCopyResult } from "../types/ai-studio";

interface CampaignCopyGeneratorProps {
  loading: boolean;
  disabled: boolean;
  onGenerate: (payload: {
    campaignName: string;
    audience?: string;
    offerDetails?: string;
    channel?: "email" | "sms" | "both";
    tone?: string;
  }) => Promise<CampaignCopyResult | null>;
}

export function CampaignCopyGenerator({
  loading,
  disabled,
  onGenerate,
}: CampaignCopyGeneratorProps) {
  const [campaignName, setCampaignName] = useState("");
  const [audience, setAudience] = useState("");
  const [offerDetails, setOfferDetails] = useState("");
  const [channel, setChannel] = useState<"email" | "sms" | "both">("both");
  const [tone, setTone] = useState("friendly");
  const [result, setResult] = useState<CampaignCopyResult | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!campaignName.trim()) return;
    const data = await onGenerate({
      campaignName: campaignName.trim(),
      audience: audience || undefined,
      offerDetails: offerDetails || undefined,
      channel,
      tone,
    });
    if (data) setResult(data);
  };

  const copyText = async (text: string) => {
    await navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <form onSubmit={handleSubmit} className="space-y-4 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/40">
        <div className="flex items-center gap-2 mb-2">
          <Megaphone className="w-5 h-5 text-brand-600" />
          <h3 className="font-bold text-slate-900 dark:text-white">Campaign copy</h3>
        </div>

        <input
          required
          value={campaignName}
          onChange={(e) => setCampaignName(e.target.value)}
          placeholder="Campaign name *"
          disabled={disabled}
          className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 outline-none"
        />
        <input
          value={audience}
          onChange={(e) => setAudience(e.target.value)}
          placeholder="Target audience (optional)"
          disabled={disabled}
          className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 outline-none"
        />
        <textarea
          value={offerDetails}
          onChange={(e) => setOfferDetails(e.target.value)}
          placeholder="Offer details — discount, promo code, deadline (optional)"
          rows={3}
          disabled={disabled}
          className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 outline-none resize-none"
        />
        <select
          value={channel}
          onChange={(e) => setChannel(e.target.value as "email" | "sms" | "both")}
          disabled={disabled}
          className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 outline-none"
        >
          <option value="both">Email + SMS</option>
          <option value="email">Email only</option>
          <option value="sms">SMS only</option>
        </select>
        <select
          value={tone}
          onChange={(e) => setTone(e.target.value)}
          disabled={disabled}
          className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 outline-none"
        >
          <option value="friendly">Friendly</option>
          <option value="urgent">Urgent</option>
          <option value="professional">Professional</option>
          <option value="playful">Playful</option>
        </select>
        <button
          type="submit"
          disabled={disabled || loading || !campaignName.trim()}
          className="inline-flex items-center gap-2 px-5 py-3 bg-brand-600 text-white font-bold rounded-xl disabled:opacity-60"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          Generate copy
        </button>
      </form>

      <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/30 space-y-4">
        <h3 className="font-bold text-slate-900 dark:text-white">Generated output</h3>
        {!result ? (
          <p className="text-sm text-slate-500">Results will appear here after generation.</p>
        ) : (
          <>
            {result.emailSubject ? (
              <CopyBlock label="Email subject" value={result.emailSubject} onCopy={copyText} />
            ) : null}
            {result.emailBody ? (
              <CopyBlock label="Email body" value={result.emailBody} onCopy={copyText} />
            ) : null}
            {result.smsText ? (
              <CopyBlock label="SMS text" value={result.smsText} onCopy={copyText} />
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}

function CopyBlock({
  label,
  value,
  onCopy,
}: {
  label: string;
  value: string;
  onCopy: (text: string) => void;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</span>
        <button type="button" onClick={() => onCopy(value)} className="text-slate-400 hover:text-brand-600">
          <Copy className="w-3.5 h-3.5" />
        </button>
      </div>
      <p className="text-sm text-slate-800 dark:text-slate-100 whitespace-pre-wrap">{value}</p>
    </div>
  );
}
