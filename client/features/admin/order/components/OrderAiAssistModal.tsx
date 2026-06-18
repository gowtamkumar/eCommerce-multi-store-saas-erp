"use client";

import type { OrderAssistResult, OrderEmailTemplate } from "@/features/admin/ai/types/ai-studio";
import type { Order } from "@/types/order";
import { Check, Copy, Mail, Sparkles, X } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { OrderAiAssist } from "./OrderAiAssist";

const inputClass =
  "w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all text-sm";
const labelClass = "text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400";

const EMAIL_TEMPLATES: { value: OrderEmailTemplate; label: string }[] = [
  { value: "status_update", label: "Status update" },
  { value: "shipped", label: "Shipped / tracking" },
  { value: "delay", label: "Delay apology" },
  { value: "cancellation", label: "Cancellation" },
  { value: "payment_issue", label: "Payment issue" },
  { value: "general", label: "General update" },
];

type AssistTab = "status" | "email";

interface OrderAiAssistModalProps {
  order: Order;
  initialTab?: AssistTab;
  onClose: () => void;
}

export default function OrderAiAssistModal({
  order,
  initialTab = "status",
  onClose,
}: OrderAiAssistModalProps) {
  const [tab, setTab] = useState<AssistTab>(initialTab);
  const [emailTemplate, setEmailTemplate] = useState<OrderEmailTemplate>("status_update");
  const [explanation, setExplanation] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    setTab(initialTab);
    setExplanation("");
    setEmailSubject("");
    setEmailBody("");
    setEmailTemplate(
      order.status?.toLowerCase() === "shipped" ? "shipped" : "status_update",
    );
  }, [order, initialTab]);

  const applyResult = (result: OrderAssistResult) => {
    if (result.explanation) setExplanation(result.explanation);
    if (result.emailSubject) setEmailSubject(result.emailSubject);
    if (result.emailBody) setEmailBody(result.emailBody);
    toast.success("AI draft applied — review before sending");
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
    if (!order.customerEmail) {
      toast.error("No customer email on this order");
      return;
    }
    if (!emailSubject.trim() || !emailBody.trim()) {
      toast.error("Generate or enter subject and body first");
      return;
    }

    const params = new URLSearchParams({
      subject: emailSubject.trim(),
      body: emailBody.trim(),
    });
    window.location.href = `mailto:${order.customerEmail}?${params.toString()}`;
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
              <h3 className="font-bold text-slate-900 dark:text-white truncate">Order AI assist</h3>
              <p className="text-xs text-slate-500 truncate">
                #{order.id.slice(-8)} · {order.customerName}
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
          <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-950 rounded-xl">
            {(["status", "email"] as const).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setTab(value)}
                className={`flex-1 px-3 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-colors ${
                  tab === value
                    ? "bg-white dark:bg-slate-800 text-brand-600 shadow-sm"
                    : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                }`}
              >
                {value === "status" ? "Status" : "Customer email"}
              </button>
            ))}
          </div>

          {tab === "email" && (
            <div className="space-y-1.5">
              <label className={labelClass}>Email template</label>
              <select
                value={emailTemplate}
                onChange={(e) => setEmailTemplate(e.target.value as OrderEmailTemplate)}
                className={inputClass}
              >
                {EMAIL_TEMPLATES.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          <OrderAiAssist
            order={order}
            context={tab}
            emailTemplate={emailTemplate}
            onApply={applyResult}
          />

          {tab === "status" ? (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className={labelClass}>Status explanation</label>
                <button
                  type="button"
                  onClick={() => copyText("explanation", explanation)}
                  disabled={!explanation}
                  className="text-slate-400 hover:text-brand-600 disabled:opacity-40"
                >
                  {copiedField === "explanation" ? (
                    <Check className="w-3.5 h-3.5" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
              <textarea
                value={explanation}
                onChange={(e) => setExplanation(e.target.value)}
                rows={6}
                placeholder="Internal explanation for admins will appear here..."
                className={`${inputClass} resize-y`}
              />
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                For your team only — not sent to the customer.
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className={labelClass}>Email subject</label>
                  <button
                    type="button"
                    onClick={() => copyText("subject", emailSubject)}
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
                  placeholder="Subject line..."
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
                    {copiedField === "body" ? (
                      <Check className="w-3.5 h-3.5" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
                <textarea
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  rows={8}
                  placeholder="Customer email draft..."
                  className={`${inputClass} resize-y`}
                />
              </div>
            </>
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
          {tab === "email" && (
            <button
              type="button"
              onClick={openMailto}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black bg-brand-600 hover:bg-brand-700 text-white transition-all shadow-lg shadow-brand-500/10 uppercase tracking-wider"
            >
              <Mail className="w-4 h-4" />
              Open in email client
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
