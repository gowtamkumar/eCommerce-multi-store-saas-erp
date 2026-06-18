"use client";

import { AiInlineBar } from "@/features/admin/ai/components/AiInlineBar";
import { useAiGenerate } from "@/features/admin/ai/hooks/useAiGenerate";
import type { PageSeoResult } from "@/features/admin/ai/types/ai-studio";
import { useState } from "react";
import toast from "react-hot-toast";

interface PageSeoAiAssistProps {
  pageTitle: string;
  onApply: (result: PageSeoResult) => void;
}

export function PageSeoAiAssist({ pageTitle, onApply }: PageSeoAiAssistProps) {
  const { configured, loading, generatePageSeo } = useAiGenerate();
  const [keywords, setKeywords] = useState("");

  const handleGenerate = async () => {
    if (!pageTitle.trim()) {
      toast.error("Enter a page title first");
      return;
    }

    const result = await generatePageSeo({
      pageTitle: pageTitle.trim(),
      keywords: keywords.trim() || undefined,
    });

    if (!result) return;

    onApply(result);
    toast.success("AI SEO applied to meta title & description");
  };

  return (
    <AiInlineBar
      title="AI page SEO"
      hint="Generate meta title and description from your page title"
      configured={configured}
      loading={loading}
      disabled={!pageTitle.trim()}
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
