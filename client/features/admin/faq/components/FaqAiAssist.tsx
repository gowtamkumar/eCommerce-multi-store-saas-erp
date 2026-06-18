"use client";

import { AiInlineBar } from "@/features/admin/ai/components/AiInlineBar";
import { useAiGenerate } from "@/features/admin/ai/hooks/useAiGenerate";
import type { FaqContentResult } from "@/features/admin/ai/types/ai-studio";
import { useState } from "react";
import toast from "react-hot-toast";

interface FaqAiAssistProps {
  category?: string;
  onApply: (result: FaqContentResult) => void;
}

export function FaqAiAssist({ category, onApply }: FaqAiAssistProps) {
  const { configured, loading, generateFaq } = useAiGenerate();
  const [topic, setTopic] = useState("");

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast.error("Enter a topic or question hint first");
      return;
    }

    const result = await generateFaq({
      topic: topic.trim(),
      category: category?.trim() || undefined,
    });

    if (!result) return;

    onApply(result);
    toast.success("AI content applied to question & answer");
  };

  return (
    <AiInlineBar
      title="AI FAQ writer"
      hint="Describe the topic — AI will draft a question and answer"
      configured={configured}
      loading={loading}
      disabled={!topic.trim()}
      onGenerate={handleGenerate}
    >
      <input
        type="text"
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        disabled={loading}
        placeholder="e.g. return policy, shipping times"
        className="flex-1 min-w-[160px] px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm outline-none"
      />
    </AiInlineBar>
  );
}
