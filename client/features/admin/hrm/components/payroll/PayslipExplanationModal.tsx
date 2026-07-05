"use client";

import { AiInlineBar } from "@/features/admin/ai/components/AiInlineBar";
import { useAiGenerate } from "@/features/admin/ai/hooks/useAiGenerate";
import { BookOpen, Check, Copy, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import type { PayrollBatch, PayrollSlip } from "../../hooks/usePayrollManager";
import {
  buildPayslipExplanationPayload,
  buildPayslipExplanationSummary,
  type PayrollSlipDetails,
} from "../../lib/buildPayslipExplanationContext";
import { useSettings } from "@/hooks/SettingsContext";
import { formatCurrency } from "@/lib/utils";

const labelClass = "text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400";
const inputClass =
  "w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all text-sm resize-y";

export interface PayslipExplanationModalProps {
  batch: PayrollBatch;
  slip: PayrollSlip & { details?: PayrollSlipDetails };
  onClose: () => void;
}

export default function PayslipExplanationModal({
  batch,
  slip,
  onClose,
}: PayslipExplanationModalProps) {
  const { configured, loading, generatePayslipExplanation } = useAiGenerate();
  const { selectedCurrency } = useSettings();
  const currencySymbol = selectedCurrency?.symbol || '$';
  const [emailSubject, setEmailSubject] = useState("");
  const [employeeMessage, setEmployeeMessage] = useState("");
  const [breakdownBullets, setBreakdownBullets] = useState<string[]>([]);
  const [internalNotes, setInternalNotes] = useState<string[]>([]);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const payslipSummary = useMemo(
    () => buildPayslipExplanationSummary(batch, slip),
    [batch, slip],
  );

  useEffect(() => {
    setEmailSubject("");
    setEmployeeMessage("");
    setBreakdownBullets([]);
    setInternalNotes([]);
    setCopiedField(null);
  }, [payslipSummary]);

  const handleGenerate = async () => {
    try {
      const existingDraft = [emailSubject, employeeMessage].filter(Boolean).join("\n\n");
      const result = await generatePayslipExplanation(
        buildPayslipExplanationPayload(payslipSummary, existingDraft),
      );
      if (!result) return;

      setEmailSubject(result.emailSubject);
      setEmployeeMessage(result.employeeMessage);
      setBreakdownBullets(result.breakdownBullets || []);
      setInternalNotes(result.internalNotes || []);
      toast.success("Payslip explanation generated — review before sending");
    } catch {
      toast.error("Failed to generate payslip explanation");
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
    const bullets =
      breakdownBullets.length > 0
        ? `\n\nBreakdown:\n${breakdownBullets.map((item) => `• ${item}`).join("\n")}`
        : "";
    await copyText("all", `Subject: ${emailSubject}\n\n${employeeMessage}${bullets}`);
  };

  const employeeName = slip.employee?.user?.name || "Employee";

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-slate-900 dark:text-white truncate">Payslip explanation</h3>
              <p className="text-xs text-slate-500 truncate">
                {employeeName} · {batch.period} · Net {formatCurrency(slip.netSalary, currencySymbol)}
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
          <AiInlineBar
            title="Generate employee explanation"
            hint="Template fill from payslip data — draft only, HR sends manually"
            configured={configured}
            loading={loading}
            onGenerate={handleGenerate}
          />

          {breakdownBullets.length > 0 && (
            <ul className="space-y-2 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30 p-4">
              {breakdownBullets.map((item) => (
                <li key={item} className="text-xs font-medium text-indigo-900 dark:text-indigo-200 flex gap-2">
                  <span className="text-indigo-500">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          )}

          {internalNotes.length > 0 && (
            <ul className="space-y-1 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 p-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-amber-700 dark:text-amber-300 mb-2">
                HR notes (internal)
              </p>
              {internalNotes.map((item) => (
                <li key={item} className="text-xs font-medium text-amber-900 dark:text-amber-200">
                  • {item}
                </li>
              ))}
            </ul>
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
              placeholder="Generate subject line..."
              className={inputClass}
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className={labelClass}>Employee message</label>
              <button
                type="button"
                onClick={() => void copyText("message", employeeMessage)}
                disabled={!employeeMessage}
                className="text-slate-400 hover:text-brand-600 disabled:opacity-40"
              >
                {copiedField === "message" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <textarea
              value={employeeMessage}
              onChange={(e) => setEmployeeMessage(e.target.value)}
              rows={8}
              placeholder="Generate employee-facing payslip explanation..."
              className={inputClass}
            />
          </div>

          <div className="flex items-center justify-between gap-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Draft only — verify figures before sending to employee.
            </p>
            <button
              type="button"
              onClick={() => void copyAll()}
              disabled={!emailSubject && !employeeMessage}
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
