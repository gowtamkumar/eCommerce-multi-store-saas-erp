"use client";

import { AiInlineBar } from "@/features/admin/ai/components/AiInlineBar";
import { useAiGenerate } from "@/features/admin/ai/hooks/useAiGenerate";
import toast from "react-hot-toast";
import {
  buildExpenseCategoryPayload,
  normalizeExpenseCategoryValue,
  type ExpenseCategoryFormFields,
} from "../lib/buildExpenseCategoryContext";

export interface ExpenseCategoryAiAssistProps extends ExpenseCategoryFormFields {
  onApply: (category: string, reasoning: string) => void;
}

export function ExpenseCategoryAiAssist({
  title,
  description,
  amount,
  referenceNumber,
  currentCategory,
  onApply,
}: ExpenseCategoryAiAssistProps) {
  const { configured, loading, generateExpenseCategorySuggest } = useAiGenerate();

  const hasContext = Boolean(title.trim() || description?.trim());

  const handleGenerate = async () => {
    if (!hasContext) {
      toast.error("Enter a title or description first");
      return;
    }

    try {
      const result = await generateExpenseCategorySuggest(
        buildExpenseCategoryPayload({
          title,
          description,
          amount,
          referenceNumber,
          currentCategory,
        }),
      );
      if (!result?.suggestedCategory) return;

      onApply(normalizeExpenseCategoryValue(result.suggestedCategory), result.reasoning);
      toast.success(`Suggested category: ${result.suggestedCategory.toUpperCase()} (${result.confidence} confidence)`);
    } catch {
      toast.error("Failed to suggest expense category");
    }
  };

  return (
    <AiInlineBar
      title="AI category suggest"
      hint="Classify from title and description — review before saving"
      configured={configured}
      loading={loading}
      disabled={!hasContext}
      onGenerate={handleGenerate}
    />
  );
}
