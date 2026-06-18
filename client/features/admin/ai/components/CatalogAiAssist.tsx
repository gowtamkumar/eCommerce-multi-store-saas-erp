"use client";

import { AiInlineBar } from "@/features/admin/ai/components/AiInlineBar";
import { useAiGenerate } from "@/features/admin/ai/hooks/useAiGenerate";
import type { CatalogContentResult } from "@/features/admin/ai/types/ai-studio";
import { useState } from "react";
import toast from "react-hot-toast";

interface CatalogAiAssistProps {
  entityType: "category" | "brand";
  name: string;
  context?: string;
  description?: string;
  onApply: (result: CatalogContentResult) => void;
}

const COPY = {
  category: {
    title: "AI category copy",
    hint: "Generate description & SEO meta from the category name",
  },
  brand: {
    title: "AI brand story",
    hint: "Generate brand description & SEO meta from the brand name",
  },
};

export function CatalogAiAssist({
  entityType,
  name,
  context,
  description,
  onApply,
}: CatalogAiAssistProps) {
  const { configured, loading, generateCatalogContent } = useAiGenerate();
  const [keywords, setKeywords] = useState("");
  const labels = COPY[entityType];

  const handleGenerate = async () => {
    if (!name.trim()) {
      toast.error(entityType === "category" ? "Enter a category name first" : "Enter a brand name first");
      return;
    }

    const result = await generateCatalogContent({
      entityType,
      name: name.trim(),
      context: context?.trim() || undefined,
      keywords: keywords.trim() || undefined,
      existingDescription: description?.trim() || undefined,
    });

    if (!result) return;

    onApply(result);
    toast.success("AI content applied to description & SEO fields");
  };

  return (
    <AiInlineBar
      title={labels.title}
      hint={labels.hint}
      configured={configured}
      loading={loading}
      disabled={!name.trim()}
      onGenerate={handleGenerate}
    >
      <input
        type="text"
        value={keywords}
        onChange={(e) => setKeywords(e.target.value)}
        disabled={loading}
        placeholder="Keywords (optional)"
        className="flex-1 min-w-[120px] px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm outline-none"
      />
    </AiInlineBar>
  );
}
