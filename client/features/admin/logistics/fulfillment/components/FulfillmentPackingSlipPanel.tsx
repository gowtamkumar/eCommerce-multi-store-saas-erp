"use client";

import { AiInlineBar } from "@/features/admin/ai/components/AiInlineBar";
import { useAiGenerate } from "@/features/admin/ai/hooks/useAiGenerate";
import { Check, Copy } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { gatherPackingSlipNotesContext } from "../lib/gatherPackingSlipNotesContext";
import type { FulfillmentTaskContext } from "../lib/buildPackingSlipNotesContext";

const labelClass = "text-[10px] font-black uppercase tracking-widest text-slate-400";
const inputClass =
  "w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all text-sm resize-y";

interface FulfillmentPackingSlipPanelProps {
  task: FulfillmentTaskContext;
}

export default function FulfillmentPackingSlipPanel({ task }: FulfillmentPackingSlipPanelProps) {
  const { configured, loading, generatePackingSlipNotes } = useAiGenerate();
  const [packingSlipNotes, setPackingSlipNotes] = useState("");
  const [handlingNotes, setHandlingNotes] = useState("");
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    setPackingSlipNotes("");
    setHandlingNotes("");
    setCopiedField(null);
  }, [task.id]);

  const handleGenerate = async () => {
    try {
      const context = await gatherPackingSlipNotesContext(task);
      const result = await generatePackingSlipNotes(context);
      if (!result) return;

      setPackingSlipNotes(result.packingSlipNotes);
      setHandlingNotes(result.handlingNotes);
      toast.success("Packing slip notes generated — review before printing");
    } catch {
      toast.error("Failed to generate packing slip notes");
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
    const combined = [packingSlipNotes, "", handlingNotes ? `Handling:\n${handlingNotes}` : ""]
      .filter(Boolean)
      .join("\n");
    await copyText("all", combined);
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-[2rem] p-5 border border-slate-100 dark:border-slate-700 shadow-sm space-y-4">
      <AiInlineBar
        title="AI packing slip notes"
        hint="Draft slip text and internal handling instructions from order and pick lines"
        configured={configured}
        loading={loading}
        disabled={!task.items?.length}
        onGenerate={handleGenerate}
      />

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className={labelClass}>Packing slip notes</label>
          <button
            type="button"
            onClick={() => void copyText("slip", packingSlipNotes)}
            disabled={!packingSlipNotes}
            className="text-slate-400 hover:text-brand-600 disabled:opacity-40"
          >
            {copiedField === "slip" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
        <textarea
          value={packingSlipNotes}
          onChange={(e) => setPackingSlipNotes(e.target.value)}
          rows={4}
          placeholder="Generate notes for the packing slip..."
          className={inputClass}
        />
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className={labelClass}>Handling instructions</label>
          <button
            type="button"
            onClick={() => void copyText("handling", handlingNotes)}
            disabled={!handlingNotes}
            className="text-slate-400 hover:text-brand-600 disabled:opacity-40"
          >
            {copiedField === "handling" ? (
              <Check className="w-3.5 h-3.5" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
        <textarea
          value={handlingNotes}
          onChange={(e) => setHandlingNotes(e.target.value)}
          rows={4}
          placeholder="Internal packer instructions..."
          className={inputClass}
        />
      </div>

      <div className="flex items-center justify-between gap-3">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Draft only — not saved to the fulfillment task.
        </p>
        <button
          type="button"
          onClick={() => void copyAll()}
          disabled={!packingSlipNotes && !handlingNotes}
          className="px-4 py-2 rounded-xl text-[10px] font-bold border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 disabled:opacity-40 uppercase tracking-wider"
        >
          Copy all
        </button>
      </div>
    </div>
  );
}
