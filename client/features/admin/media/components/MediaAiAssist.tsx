"use client";

import { AiInlineBar } from "@/features/admin/ai/components/AiInlineBar";
import { useAiGenerate } from "@/features/admin/ai/hooks/useAiGenerate";
import type { MediaAssistResult } from "@/features/admin/ai/types/ai-studio";
import toast from "react-hot-toast";
import type { MediaItem } from "../type";
import { buildMediaAssistPayload, isVisionEligible } from "../lib/buildMediaAssistContext";

interface MediaAiAssistProps {
  item: MediaItem;
  useVision: boolean;
  contextHint: string;
  onApply: (result: MediaAssistResult) => void;
}

export function MediaAiAssist({ item, useVision, contextHint, onApply }: MediaAiAssistProps) {
  const { configured, loading, generateMediaAssist } = useAiGenerate();

  const handleGenerate = async () => {
    const result = await generateMediaAssist(
      buildMediaAssistPayload(item, { useVision, contextHint }),
    );

    if (!result) return;
    onApply(result);
    toast.success(
      result.visionUsed
        ? "Alt text and filename generated with vision"
        : "Alt text and filename generated from metadata",
    );
  };

  return (
    <AiInlineBar
      title="AI alt text & filename"
      hint={
        useVision && isVisionEligible(item)
          ? "Uses vision when your AI provider supports image input"
          : "Generates from filename and file metadata"
      }
      configured={configured}
      loading={loading}
      onGenerate={handleGenerate}
    />
  );
}
