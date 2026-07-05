"use client";

import { AiInlineBar } from "@/features/admin/ai/components/AiInlineBar";
import { useAiGenerate } from "@/features/admin/ai/hooks/useAiGenerate";
import type { ArAgingRow } from "@/features/admin/customer/type";
import { useSettings } from "@/hooks/SettingsContext";
import { Check, Copy, Loader2, Mail, X } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  buildArCollectionDraftPayload,
  gatherArCollectionContext,
  getOldestAgingBucket,
  getOverdueAmount,
} from "../../lib/buildArCollectionContext";

const labelClass = "text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400";
const inputClass =
  "w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all text-sm resize-y";

export interface ArCollectionDraftModalProps {
  customer: ArAgingRow;
  onClose: () => void;
}

export default function ArCollectionDraftModal({ customer, onClose }: ArCollectionDraftModalProps) {
  const { formatPrice } = useSettings();
  const { configured, loading, generateArCollectionDraft } = useAiGenerate();
  const [contextLoading, setContextLoading] = useState(true);
  const [context, setContext] = useState<{ customerSummary: string; overdueInvoicesSummary: string } | null>(
    null,
  );
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [internalNotes, setInternalNotes] = useState("");
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setContextLoading(true);
    setEmailSubject("");
    setEmailBody("");
    setInternalNotes("");
    setCopiedField(null);

    void gatherArCollectionContext(customer).then((result) => {
      if (!active) return;
      setContext(result);
      setContextLoading(false);
    });

    return () => {
      active = false;
    };
  }, [customer]);

  const handleGenerate = async () => {
    if (!context) return;

    try {
      const existingDraft = [emailSubject, emailBody].filter(Boolean).join("\n\n");
      const result = await generateArCollectionDraft(
        buildArCollectionDraftPayload(context, existingDraft),
      );
      if (!result) return;

      setEmailSubject(result.emailSubject);
      setEmailBody(result.emailBody);
      setInternalNotes(result.internalNotes);
      toast.success("Collection email draft generated — review before sending");
    } catch {
      toast.error("Failed to generate collection email draft");
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

  const copyEmail = async () => {
    await copyText("email", `Subject: ${emailSubject}\n\n${emailBody}`);
  };

  const overdueAmount = getOverdueAmount(customer);

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 shrink-0">
              <Mail className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-slate-900 dark:text-white truncate">Collection email draft</h3>
              <p className="text-xs text-slate-500 truncate">
                {customer.customerName} · Overdue {formatPrice(overdueAmount)} · {getOldestAgingBucket(customer)}
              </p>
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
          {contextLoading ? (
            <div className="flex items-center justify-center gap-2 py-12 text-slate-500">
              <Loader2 className="w-5 h-5 animate-spin" />
              Loading AR ledger context...
            </div>
          ) : (
            <>
              <AiInlineBar
                title="Generate collection email"
                hint="Draft subject and body from aging buckets and open invoice lines"
                configured={configured}
                loading={loading}
                disabled={!context || overdueAmount <= 0}
                onGenerate={handleGenerate}
              />

              {overdueAmount <= 0 && (
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  This account has no overdue balance — collection email is disabled.
                </p>
              )}

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className={labelClass}>Email subject</label>
                  <button
                    type="button"
                    onClick={() => void copyText("subject", emailSubject)}
                    disabled={!emailSubject}
                    className="text-slate-400 hover:text-brand-600 disabled:opacity-40"
                  >
                    {copiedField === "subject" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <input
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  placeholder="Generate payment reminder subject..."
                  className={inputClass}
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className={labelClass}>Email body</label>
                  <button
                    type="button"
                    onClick={() => void copyEmail()}
                    disabled={!emailSubject && !emailBody}
                    className="text-slate-400 hover:text-brand-600 disabled:opacity-40"
                  >
                    {copiedField === "email" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <textarea
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  rows={8}
                  placeholder="Generate customer-facing collection email..."
                  className={inputClass}
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className={labelClass}>Internal notes</label>
                  <button
                    type="button"
                    onClick={() => void copyText("notes", internalNotes)}
                    disabled={!internalNotes}
                    className="text-slate-400 hover:text-brand-600 disabled:opacity-40"
                  >
                    {copiedField === "notes" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <textarea
                  value={internalNotes}
                  onChange={(e) => setInternalNotes(e.target.value)}
                  rows={4}
                  placeholder="Internal finance follow-up reminders..."
                  className={inputClass}
                />
              </div>

              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Draft only — finance sends manually; no auto-email or ledger changes.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
