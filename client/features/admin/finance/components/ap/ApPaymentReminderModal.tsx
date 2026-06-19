"use client";

import { AiInlineBar } from "@/features/admin/ai/components/AiInlineBar";
import { useAiGenerate } from "@/features/admin/ai/hooks/useAiGenerate";
import { Check, Copy, UserCheck, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { buildApPaymentReminderPayload } from "../../lib/buildApPaymentReminderContext";

const labelClass = "text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400";
const inputClass =
  "w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all text-sm resize-y";

export interface ApPaymentReminderModalProps {
  title: string;
  subtitle: string;
  apSummary: string;
  invoicesSummary: string;
  hasActionableBalance: boolean;
  onClose: () => void;
}

export default function ApPaymentReminderModal({
  title,
  subtitle,
  apSummary,
  invoicesSummary,
  hasActionableBalance,
  onClose,
}: ApPaymentReminderModalProps) {
  const { configured, loading, generateApPaymentReminder } = useAiGenerate();
  const [reminderSubject, setReminderSubject] = useState("");
  const [reminderBody, setReminderBody] = useState("");
  const [actionItems, setActionItems] = useState<string[]>([]);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const contextKey = useMemo(
    () => `${apSummary}::${invoicesSummary}`,
    [apSummary, invoicesSummary],
  );

  useEffect(() => {
    setReminderSubject("");
    setReminderBody("");
    setActionItems([]);
    setCopiedField(null);
  }, [contextKey]);

  const handleGenerate = async () => {
    try {
      const existingDraft = [reminderSubject, reminderBody].filter(Boolean).join("\n\n");
      const result = await generateApPaymentReminder(
        buildApPaymentReminderPayload(apSummary, invoicesSummary, existingDraft),
      );
      if (!result) return;

      setReminderSubject(result.reminderSubject);
      setReminderBody(result.reminderBody);
      setActionItems(result.actionItems || []);
      toast.success("Approver reminder generated — review before sending");
    } catch {
      toast.error("Failed to generate AP payment reminder");
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
    const checklist =
      actionItems.length > 0
        ? `\n\nAction items:\n${actionItems.map((item) => `• ${item}`).join("\n")}`
        : "";
    await copyText("all", `Subject: ${reminderSubject}\n\n${reminderBody}${checklist}`);
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 shrink-0">
              <UserCheck className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-slate-900 dark:text-white truncate">{title}</h3>
              <p className="text-xs text-slate-500 truncate">{subtitle}</p>
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
          <AiInlineBar
            title="Generate approver reminder"
            hint="Internal draft for finance approver — not sent to suppliers"
            configured={configured}
            loading={loading}
            disabled={!hasActionableBalance}
            onGenerate={handleGenerate}
          />

          {!hasActionableBalance && (
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              No overdue or selected payable balance — reminder is disabled.
            </p>
          )}

          {actionItems.length > 0 && (
            <ul className="space-y-2 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30 p-4">
              {actionItems.map((item) => (
                <li key={item} className="text-xs font-medium text-indigo-900 dark:text-indigo-200 flex gap-2">
                  <span className="text-indigo-500">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          )}

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className={labelClass}>Reminder subject</label>
              <button
                type="button"
                onClick={() => void copyText("subject", reminderSubject)}
                disabled={!reminderSubject}
                className="text-slate-400 hover:text-brand-600 disabled:opacity-40"
              >
                {copiedField === "subject" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <input
              value={reminderSubject}
              onChange={(e) => setReminderSubject(e.target.value)}
              placeholder="Generate internal approver subject..."
              className={inputClass}
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className={labelClass}>Reminder body</label>
              <button
                type="button"
                onClick={() => void copyText("body", reminderBody)}
                disabled={!reminderBody}
                className="text-slate-400 hover:text-brand-600 disabled:opacity-40"
              >
                {copiedField === "body" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <textarea
              value={reminderBody}
              onChange={(e) => setReminderBody(e.target.value)}
              rows={8}
              placeholder="Generate internal payment approval reminder..."
              className={inputClass}
            />
          </div>

          <div className="flex items-center justify-between gap-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Draft only — finance sends manually; no auto-approval or payment.
            </p>
            <button
              type="button"
              onClick={() => void copyAll()}
              disabled={!reminderSubject && !reminderBody}
              className="px-4 py-2 rounded-xl text-[10px] font-bold border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 disabled:opacity-40 uppercase tracking-wider"
            >
              Copy all
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
