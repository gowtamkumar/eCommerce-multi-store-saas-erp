"use client";

import { AiInlineBar } from "@/features/admin/ai/components/AiInlineBar";
import { useAiGenerate } from "@/features/admin/ai/hooks/useAiGenerate";
import type { ReviewAssistResult } from "@/features/admin/ai/types/ai-studio";
import toast from "react-hot-toast";
import type { AdminReview } from "../types";
import { buildReviewAssistPayload } from "../lib/buildReviewAssistContext";

interface ReviewAiAssistProps {
  review: AdminReview;
  onApply: (result: ReviewAssistResult) => void;
}

export function ReviewAiAssist({ review, onApply }: ReviewAiAssistProps) {
  const { configured, loading, generateReviewAssist } = useAiGenerate();

  const handleGenerate = async () => {
    const result = await generateReviewAssist(buildReviewAssistPayload(review));
    if (!result) return;

    onApply(result);
    toast.success("Moderation assist generated — review before acting");
  };

  return (
    <AiInlineBar
      title="AI moderation assist"
      hint="Draft a public reply and flag toxicity or policy concerns"
      configured={configured}
      loading={loading}
      onGenerate={handleGenerate}
    />
  );
}
