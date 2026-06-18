"use client";

import { AiInlineBar } from "@/features/admin/ai/components/AiInlineBar";
import { useAiGenerate } from "@/features/admin/ai/hooks/useAiGenerate";
import type { StoreSeoResult } from "@/features/admin/ai/types/ai-studio";
import { useState } from "react";
import toast from "react-hot-toast";

interface StoreSeoAiAssistProps {
  brandName: string;
  siteDescription?: string;
  onApply: (result: StoreSeoResult) => void;
}

export function StoreSeoAiAssist({ brandName, siteDescription, onApply }: StoreSeoAiAssistProps) {
  const { configured, loading, generateStoreSeo } = useAiGenerate();
  const [keywords, setKeywords] = useState("");

  const handleGenerate = async () => {
    if (!brandName.trim()) {
      toast.error("Set your brand name in General Settings first");
      return;
    }

    const result = await generateStoreSeo({
      brandName: brandName.trim(),
      keywords: keywords.trim() || undefined,
      existingDescription: siteDescription?.trim() || undefined,
    });

    if (!result) return;

    onApply(result);
    toast.success("AI SEO applied to store meta fields");
  };

  return (
    <AiInlineBar
      title="AI store SEO"
      hint="Generate default meta title & description for your storefront"
      configured={configured}
      loading={loading}
      disabled={!brandName.trim()}
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
