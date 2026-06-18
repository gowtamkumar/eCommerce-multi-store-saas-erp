"use client";

import type { LeadFollowUpIntent, LeadFollowUpResult } from "@/features/admin/ai/types/ai-studio";
import { Check, Copy, Mail, X } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import type { LeadMessage } from "../type";
import { LeadFollowUpAiAssist } from "./LeadFollowUpAiAssist";

const inputClass =
  "w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all text-sm";
const labelClass = "text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400";

const INTENT_OPTIONS: { value: LeadFollowUpIntent; label: string }[] = [
  { value: "welcome", label: "Welcome / thank-you" },
  { value: "follow_up", label: "Follow-up reply" },
  { value: "nurture", label: "Nurture sequence" },
  { value: "conversion", label: "Conversion nudge" },
];

interface LeadFollowUpModalProps {
  lead: LeadMessage;
  onClose: () => void;
}

export default function LeadFollowUpModal({ lead, onClose }: LeadFollowUpModalProps) {
  const [intent, setIntent] = useState<LeadFollowUpIntent>("follow_up");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [smsText, setSmsText] = useState("");
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    setIntent(lead.status === "new" ? "welcome" : "follow_up");
    setEmailSubject("");
    setEmailBody("");
    setSmsText("");
  }, [lead]);

  const applyResult = (result: LeadFollowUpResult) => {
    setEmailSubject(result.emailSubject);
    setEmailBody(result.emailBody);
    if (result.smsText) setSmsText(result.smsText);
    toast.success("AI follow-up applied — review before sending");
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

  const openMailto = () => {
    if (!emailSubject.trim() || !emailBody.trim()) {
      toast.error("Generate or enter subject and body first");
      return;
    }

    const params = new URLSearchParams({
      subject: emailSubject.trim(),
      body: emailBody.trim(),
    });
    window.location.href = `mailto:${lead.email}?${params.toString()}`;
  };

  return (
    <div className="fixed inset-0 z-70 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800 max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950/20 flex items-center justify-center text-brand-600 shrink-0">
              <Mail className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-slate-900 dark:text-white truncate">Draft follow-up email</h3>
              <p className="text-xs text-slate-500 truncate">
                {lead.name} · {lead.email}
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
          {(lead.subject || lead.message) && (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 space-y-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Lead context</p>
              {lead.subject && (
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{lead.subject}</p>
              )}
              {lead.message && (
                <p className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-wrap">{lead.message}</p>
              )}
            </div>
          )}

          <div className="space-y-1.5">
            <label className={labelClass}>Email intent</label>
            <select
              value={intent}
              onChange={(event) => setIntent(event.target.value as LeadFollowUpIntent)}
              className={inputClass}
            >
              {INTENT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <LeadFollowUpAiAssist lead={lead} intent={intent} onApply={applyResult} />

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className={labelClass}>Email subject</label>
              <button
                type="button"
                onClick={() => copyText("subject", emailSubject)}
                disabled={!emailSubject}
                className="text-slate-400 hover:text-brand-600 disabled:opacity-40"
              >
                {copiedField === "subject" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <input
              type="text"
              value={emailSubject}
              onChange={(event) => setEmailSubject(event.target.value)}
              placeholder="Personalized subject line..."
              className={inputClass}
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className={labelClass}>Email body</label>
              <button
                type="button"
                onClick={() => copyText("body", emailBody)}
                disabled={!emailBody}
                className="text-slate-400 hover:text-brand-600 disabled:opacity-40"
              >
                {copiedField === "body" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <textarea
              value={emailBody}
              onChange={(event) => setEmailBody(event.target.value)}
              rows={8}
              placeholder="Email body will appear here after generation..."
              className={`${inputClass} resize-y`}
            />
          </div>

          {smsText && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className={labelClass}>SMS follow-up (optional)</label>
                <button
                  type="button"
                  onClick={() => copyText("sms", smsText)}
                  className="text-slate-400 hover:text-brand-600"
                >
                  {copiedField === "sms" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-wrap">{smsText}</p>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 p-6 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all uppercase tracking-wider"
          >
            Close
          </button>
          <button
            type="button"
            onClick={openMailto}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black bg-brand-600 hover:bg-brand-700 text-white transition-all shadow-lg shadow-brand-500/10 uppercase tracking-wider"
          >
            <Mail className="w-4 h-4" />
            Open in email client
          </button>
        </div>
      </div>
    </div>
  );
}
