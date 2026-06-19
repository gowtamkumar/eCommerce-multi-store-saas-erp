"use client";

import { AiInlineBar } from "@/features/admin/ai/components/AiInlineBar";
import { useAiGenerate } from "@/features/admin/ai/hooks/useAiGenerate";
import { AlertTriangle, Check, Copy } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { buildGrnDiscrepancyPayload } from "../lib/buildGrnDiscrepancyContext";
import type { GrnData } from "../types";

const labelClass = "text-[10px] font-black uppercase tracking-widest text-slate-400";
const inputClass =
  "w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all text-sm resize-y";

interface GrnDiscrepancyNotesPanelProps {
  grn: GrnData;
  disabled?: boolean;
}

export default function GrnDiscrepancyNotesPanel({ grn, disabled }: GrnDiscrepancyNotesPanelProps) {
  const { configured, loading, generateGrnDiscrepancyNotes } = useAiGenerate();
  const [discrepancyNotes, setDiscrepancyNotes] = useState("");
  const [lineHighlights, setLineHighlights] = useState<string[]>([]);
  const [supplierFollowUp, setSupplierFollowUp] = useState("");
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const hasDiscrepancies = useMemo(
    () => (grn.items || []).some((item) => Number(item.orderedQty) !== Number(item.receivedQty)),
    [grn.items],
  );

  const contextKey = useMemo(
    () => `${grn.id}-${grn.status}-${(grn.items || []).map((i) => `${i.orderedQty}:${i.receivedQty}`).join("|")}`,
    [grn],
  );

  useEffect(() => {
    setDiscrepancyNotes("");
    setLineHighlights([]);
    setSupplierFollowUp("");
    setCopiedField(null);
  }, [contextKey]);

  const handleGenerate = async () => {
    try {
      const result = await generateGrnDiscrepancyNotes(
        buildGrnDiscrepancyPayload(grn, discrepancyNotes),
      );
      if (!result) return;

      setDiscrepancyNotes(result.discrepancyNotes);
      setLineHighlights(result.lineHighlights || []);
      setSupplierFollowUp(result.supplierFollowUp);
      toast.success("Discrepancy notes generated — review before saving or sending");
    } catch {
      toast.error("Failed to generate GRN discrepancy notes");
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
    const highlights =
      lineHighlights.length > 0
        ? `\n\nHighlights:\n${lineHighlights.map((h) => `• ${h}`).join("\n")}`
        : "";
    const combined = [discrepancyNotes, highlights, supplierFollowUp ? `\n\nSupplier follow-up:\n${supplierFollowUp}` : ""]
      .filter(Boolean)
      .join("");
    await copyText("all", combined);
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm space-y-4">
      <div className="flex items-start justify-between gap-3">
        <AiInlineBar
          title="AI receipt discrepancy notes"
          hint={
            hasDiscrepancies
              ? "Draft internal audit notes and supplier follow-up from ordered vs received lines"
              : "All lines match — generate confirmation notes or investigate edge cases"
          }
          configured={configured}
          loading={loading}
          disabled={disabled || !(grn.items?.length)}
          onGenerate={handleGenerate}
        />
        {hasDiscrepancies && (
          <span className="shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 text-[10px] font-black uppercase tracking-wider">
            <AlertTriangle className="w-3.5 h-3.5" />
            Discrepancies
          </span>
        )}
      </div>

      {lineHighlights.length > 0 && (
        <ul className="space-y-2 rounded-2xl bg-amber-50/60 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 p-4">
          {lineHighlights.map((highlight) => (
            <li key={highlight} className="text-xs font-medium text-amber-900 dark:text-amber-200 flex gap-2">
              <span className="text-amber-500">•</span>
              <span>{highlight}</span>
            </li>
          ))}
        </ul>
      )}

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className={labelClass}>Internal discrepancy notes</label>
          <button
            type="button"
            onClick={() => void copyText("notes", discrepancyNotes)}
            disabled={!discrepancyNotes}
            className="text-slate-400 hover:text-brand-600 disabled:opacity-40"
          >
            {copiedField === "notes" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
        <textarea
          value={discrepancyNotes}
          onChange={(e) => setDiscrepancyNotes(e.target.value)}
          rows={6}
          placeholder="Generate internal receipt audit narrative..."
          className={inputClass}
        />
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className={labelClass}>Supplier follow-up draft</label>
          <button
            type="button"
            onClick={() => void copyText("supplier", supplierFollowUp)}
            disabled={!supplierFollowUp}
            className="text-slate-400 hover:text-brand-600 disabled:opacity-40"
          >
            {copiedField === "supplier" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
        <textarea
          value={supplierFollowUp}
          onChange={(e) => setSupplierFollowUp(e.target.value)}
          rows={5}
          placeholder="Draft supplier message about shortages or over-receipts..."
          className={inputClass}
        />
      </div>

      <div className="flex items-center justify-between gap-3">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Draft only — not saved to the GRN record.
        </p>
        <button
          type="button"
          onClick={() => void copyAll()}
          disabled={!discrepancyNotes && !supplierFollowUp}
          className="px-4 py-2 rounded-xl text-[10px] font-bold border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 disabled:opacity-40 uppercase tracking-wider"
        >
          Copy all
        </button>
      </div>
    </div>
  );
}
