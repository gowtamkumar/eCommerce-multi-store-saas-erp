"use client";

import { AiInlineBar } from "@/features/admin/ai/components/AiInlineBar";
import { useAiGenerate } from "@/features/admin/ai/hooks/useAiGenerate";
import type { StockTransferReasonResult } from "@/features/admin/ai/types/ai-studio";
import toast from "react-hot-toast";

interface StockTransferReasonAiAssistProps {
  transferSummary: string;
  existingRemarks?: string;
  disabled?: boolean;
  onApply: (result: StockTransferReasonResult) => void;
}

export function StockTransferReasonAiAssist({
  transferSummary,
  existingRemarks,
  disabled,
  onApply,
}: StockTransferReasonAiAssistProps) {
  const { configured, loading, generateStockTransferReason } = useAiGenerate();

  const handleGenerate = async () => {
    try {
      const result = await generateStockTransferReason({
        transferSummary,
        existingRemarks: existingRemarks?.trim() || undefined,
      });
      if (!result) return;

      onApply(result);
      toast.success("Transfer reason notes generated — review before saving");
    } catch {
      toast.error("Failed to generate transfer reason notes");
    }
  };

  return (
    <AiInlineBar
      title="AI transfer reason"
      hint="Draft remarks and audit notes from route and line items — admin saves manually"
      configured={configured}
      loading={loading}
      disabled={disabled}
      onGenerate={handleGenerate}
    />
  );
}
