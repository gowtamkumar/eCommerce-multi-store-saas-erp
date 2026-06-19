"use client";

import { AiInlineBar } from "@/features/admin/ai/components/AiInlineBar";
import { useAiGenerate } from "@/features/admin/ai/hooks/useAiGenerate";
import { Check, Copy } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  buildSupplierProfileSummaryFromForm,
  buildSupplierSummary,
} from "../lib/buildSupplierProfileSummaryContext";
import type { Supplier } from "../types";

const labelClass = "text-[10px] font-black uppercase tracking-widest text-slate-400";
const inputClass =
  "w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all text-sm resize-y";

interface SupplierFormData {
  name: string;
  code: string;
  contactName: string;
  email: string;
  phone: string;
  address: string;
  category: string;
  rating: number;
  leadTimeDays: number;
  isActive: boolean;
}

interface SupplierProfileSummaryPanelProps {
  formData: SupplierFormData;
  categories: Array<{ id: string; name: string }>;
  supplier?: Supplier;
  disabled?: boolean;
}

export default function SupplierProfileSummaryPanel({
  formData,
  categories,
  supplier,
  disabled,
}: SupplierProfileSummaryPanelProps) {
  const { configured, loading, generateSupplierProfileSummary } = useAiGenerate();
  const [profileSummary, setProfileSummary] = useState("");
  const [supplierTags, setSupplierTags] = useState<string[]>([]);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const supplierSummary = useMemo(
    () => buildSupplierSummary(formData, categories, supplier),
    [formData, categories, supplier],
  );

  useEffect(() => {
    setProfileSummary("");
    setSupplierTags([]);
    setCopiedField(null);
  }, [supplierSummary]);

  const handleGenerate = async () => {
    try {
      const result = await generateSupplierProfileSummary(
        buildSupplierProfileSummaryFromForm(formData, categories, supplier, profileSummary),
      );
      if (!result) return;

      setProfileSummary(result.profileSummary);
      setSupplierTags(result.supplierTags || []);
      toast.success("Supplier profile summary generated — read-only draft");
    } catch {
      toast.error("Failed to generate supplier profile summary");
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
    const tags =
      supplierTags.length > 0 ? `\n\nTags:\n${supplierTags.map((tag) => `• ${tag}`).join("\n")}` : "";
    await copyText("all", `${profileSummary}${tags}`);
  };

  return (
    <div className="rounded-2xl border border-brand-100 dark:border-brand-900/40 bg-brand-50/40 dark:bg-brand-950/20 p-4 space-y-4">
      <AiInlineBar
        title="AI profile summary"
        hint="Read-only procurement briefing from supplier master data"
        configured={configured}
        loading={loading}
        disabled={disabled || !formData.name.trim()}
        onGenerate={handleGenerate}
      />

      {supplierTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {supplierTags.map((tag) => (
            <span
              key={tag}
              className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-white dark:bg-slate-900 border border-brand-100 dark:border-brand-900/40 text-brand-700 dark:text-brand-300"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className={labelClass}>Profile summary</label>
          <button
            type="button"
            onClick={() => void copyText("summary", profileSummary)}
            disabled={!profileSummary}
            className="text-slate-400 hover:text-brand-600 disabled:opacity-40"
          >
            {copiedField === "summary" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
        <textarea
          value={profileSummary}
          onChange={(e) => setProfileSummary(e.target.value)}
          rows={6}
          placeholder="Generate internal supplier briefing..."
          className={inputClass}
        />
      </div>

      <div className="flex items-center justify-between gap-3">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Draft only — not saved to the supplier record.
        </p>
        <button
          type="button"
          onClick={() => void copyAll()}
          disabled={!profileSummary}
          className="px-4 py-2 rounded-xl text-[10px] font-bold border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 disabled:opacity-40 uppercase tracking-wider"
        >
          Copy all
        </button>
      </div>
    </div>
  );
}
