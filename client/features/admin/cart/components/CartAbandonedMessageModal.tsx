"use client";

import type {
  AbandonedCartMessageResult,
  AbandonedCartMessageTemplate,
} from "@/features/admin/ai/types/ai-studio";
import type { CartSummary } from "../types";
import { Check, Copy, Mail, ShoppingBag, Sparkles, X } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useSettings } from "@/hooks/SettingsContext";
import { defaultMessageTemplateForCart } from "../lib/buildAbandonedCartContext";
import { CartAbandonedMessageAiAssist } from "./CartAbandonedMessageAiAssist";

const inputClass =
  "w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all text-sm";
const labelClass = "text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400";

const MESSAGE_TEMPLATES: { value: AbandonedCartMessageTemplate; label: string }[] = [
  { value: "gentle_reminder", label: "Gentle reminder" },
  { value: "incentive", label: "Soft incentive" },
  { value: "urgency", label: "Polite urgency" },
  { value: "win_back", label: "Win-back" },
  { value: "general", label: "General" },
];

interface CartAbandonedMessageModalProps {
  cart: CartSummary;
  onClose: () => void;
}

export default function CartAbandonedMessageModal({
  cart,
  onClose,
}: CartAbandonedMessageModalProps) {
  const { formatPrice } = useSettings();
  const [messageTemplate, setMessageTemplate] = useState<AbandonedCartMessageTemplate>("gentle_reminder");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [smsText, setSmsText] = useState("");
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    setMessageTemplate(defaultMessageTemplateForCart(cart));
    setEmailSubject("");
    setEmailBody("");
    setSmsText("");
    setCopiedField(null);
  }, [cart]);

  const applyResult = (result: AbandonedCartMessageResult) => {
    setEmailSubject(result.emailSubject);
    setEmailBody(result.emailBody);
    setSmsText(result.smsText ?? "");
    toast.success("Recovery message drafted — review before sending");
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
    if (!cart.customerEmail) {
      toast.error("No customer email on this cart");
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
    window.location.href = `mailto:${cart.customerEmail}?${params.toString()}`;
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
              <h3 className="font-bold text-slate-900 dark:text-white truncate">Abandoned cart message</h3>
              <p className="text-xs text-slate-500 truncate">
                {cart.customerName} · {formatPrice(cart.totalAmount || 0)}
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
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase">
              <ShoppingBag className="w-3.5 h-3.5" />
              {cart.itemCount} items · updated{" "}
              {cart.updatedAt ? new Date(cart.updatedAt).toLocaleString() : "recently"}
            </div>
            {(cart.items ?? []).length > 0 && (
              <ul className="text-sm text-slate-600 dark:text-slate-300 space-y-1">
                {cart.items!.map((item, index) => (
                  <li key={`${item.productName}-${index}`}>
                    {item.productName ?? "Item"} ×{item.quantity}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="space-y-1.5">
            <label className={labelClass}>Message template</label>
            <select
              value={messageTemplate}
              onChange={(e) => setMessageTemplate(e.target.value as AbandonedCartMessageTemplate)}
              className={inputClass}
            >
              {MESSAGE_TEMPLATES.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <CartAbandonedMessageAiAssist
            cart={cart}
            messageTemplate={messageTemplate}
            onApply={applyResult}
          />

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
              placeholder="Subject line..."
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
              rows={7}
              placeholder="Recovery email draft..."
              className={`${inputClass} resize-y`}
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className={labelClass}>SMS draft</label>
              <button
                type="button"
                onClick={() => void copyText("sms", smsText)}
                disabled={!smsText}
                className="text-slate-400 hover:text-brand-600 disabled:opacity-40"
              >
                {copiedField === "sms" ? (
                  <Check className="w-3.5 h-3.5" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
            <textarea
              value={smsText}
              onChange={(e) => setSmsText(e.target.value)}
              rows={3}
              placeholder="Optional SMS..."
              className={`${inputClass} resize-y`}
            />
          </div>

          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Draft only — manual send. Automated cart.abandoned triggers remain Phase C.
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
