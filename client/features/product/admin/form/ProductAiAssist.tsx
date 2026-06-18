"use client";

import type { ProductContentResult } from "@/features/admin/ai/types/ai-studio";
import { Loader2, Sparkles } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import toast from "react-hot-toast";
import { useProductAi } from "../hooks/useProductAi";

interface ProductAiAssistProps {
  productName: string;
  shortDescription?: string;
  description?: string;
  onApply: (result: ProductContentResult) => void;
}

export function ProductAiAssist({
  productName,
  shortDescription,
  description,
  onApply,
}: ProductAiAssistProps) {
  const { configured, loading, generateProductContent } = useProductAi();
  const [tone, setTone] = useState("professional");
  const [keywords, setKeywords] = useState("");

  const handleGenerate = async () => {
    if (!productName.trim()) {
      toast.error("Enter a product name first");
      return;
    }

    const result = await generateProductContent({
      productName: productName.trim(),
      keywords: keywords.trim() || undefined,
      existingDescription: description || shortDescription || undefined,
      tone,
    });

    if (!result) return;

    onApply(result);
    toast.success("AI content applied to description & SEO fields");
  };

  if (configured === null) return null;

  return (
    <div className="rounded-2xl border border-brand-200/60 dark:border-brand-900/40 bg-gradient-to-r from-brand-50/80 to-violet-50/50 dark:from-brand-950/30 dark:to-violet-950/20 p-5">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-center gap-2 min-w-0">
          <Sparkles className="w-5 h-5 text-brand-600 shrink-0" />
          <div>
            <p className="font-bold text-slate-900 dark:text-white text-sm">AI product copy</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Generate description, short summary & SEO meta from your product name
            </p>
          </div>
        </div>

        {configured ? (
          <div className="flex flex-1 flex-wrap items-center gap-2 sm:justify-end">

            <input
              type="text"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              disabled={loading}
              placeholder="Keywords (optional)"
              className="flex-1 min-w-[140px] px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm outline-none"
            />
            <button
              type="button"
              onClick={handleGenerate}
              disabled={loading || !productName.trim()}
              className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-bold rounded-xl disabled:opacity-50 whitespace-nowrap"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              Generate
            </button>
          </div>
        ) : (
          <p className="text-sm text-amber-800 dark:text-amber-200 sm:ml-auto">
            <Link href="/admin/settings/ai" className="font-bold underline">
              Configure AI
            </Link>{" "}
            to enable generation
          </p>
        )}
      </div>
    </div>
  );
}
