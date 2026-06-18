"use client";

import { AiInlineBar } from "@/features/admin/ai/components/AiInlineBar";
import { useAiGenerate } from "@/features/admin/ai/hooks/useAiGenerate";
import type { PageBlockContentResult, PageBlockType } from "@/features/admin/ai/types/ai-studio";
import { useState } from "react";
import toast from "react-hot-toast";

interface PageBlockAiAssistProps {
  blockType: PageBlockType;
  pageTitle?: string;
  existingText?: string;
  onApply: (result: PageBlockContentResult) => void;
}

const HINTS: Record<PageBlockType, string> = {
  heading: "Generate a headline from your page context",
  paragraph: "Generate paragraph copy for this block",
  button: "Generate CTA label and link",
  "text-block": "Generate headline, tagline & body copy",
};

export function PageBlockAiAssist({
  blockType,
  pageTitle,
  existingText,
  onApply,
}: PageBlockAiAssistProps) {
  const { configured, loading, generatePageBlockContent } = useAiGenerate();
  const [topic, setTopic] = useState("");

  const handleGenerate = async () => {
    if (!pageTitle?.trim() && !topic.trim()) {
      toast.error("Enter a page title (Page Settings) or describe the topic");
      return;
    }

    const result = await generatePageBlockContent({
      blockType,
      pageTitle: pageTitle?.trim() || undefined,
      topic: topic.trim() || undefined,
      existingText: existingText?.trim() || undefined,
    });

    if (!result) return;

    onApply(result);
    toast.success("AI content applied to block fields");
  };

  return (
    <AiInlineBar
      title="AI block copy"
      hint={HINTS[blockType]}
      configured={configured}
      loading={loading}
      disabled={!pageTitle?.trim() && !topic.trim()}
      onGenerate={handleGenerate}
    >
      <input
        type="text"
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        disabled={loading}
        placeholder={pageTitle?.trim() ? "Topic (optional)" : "What should this block say?"}
        className="flex-1 min-w-[120px] px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm outline-none"
      />
    </AiInlineBar>
  );
}
