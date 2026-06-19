"use client";

import { AiInlineBar } from "@/features/admin/ai/components/AiInlineBar";
import { useAiGenerate } from "@/features/admin/ai/hooks/useAiGenerate";
import type { RequisitionJustificationResult } from "@/features/admin/ai/types/ai-studio";
import toast from "react-hot-toast";
import { buildDraftRequisitionJustificationPayload } from "../lib/buildRequisitionJustificationContext";

interface RequisitionDraftItem {
  productName: string;
  quantity: number;
  notes?: string;
}

interface RequisitionJustificationAiAssistProps {
  requiredDate: string;
  items: RequisitionDraftItem[];
  existingJustification?: string;
  disabled?: boolean;
  onApply: (result: RequisitionJustificationResult) => void;
}

export function RequisitionJustificationAiAssist({
  requiredDate,
  items,
  existingJustification,
  disabled,
  onApply,
}: RequisitionJustificationAiAssistProps) {
  const { configured, loading, generateRequisitionJustification } = useAiGenerate();

  const handleGenerate = async () => {
    try {
      const payload = buildDraftRequisitionJustificationPayload(
        requiredDate,
        items,
        existingJustification,
      );
      const result = await generateRequisitionJustification(payload);
      if (!result) return;

      onApply(result);
      toast.success("Justification draft generated — review before submitting");
    } catch {
      toast.error("Failed to generate requisition justification");
    }
  };

  return (
    <AiInlineBar
      title="AI justification"
      hint="Draft PR reason and line specs from items and required date"
      configured={configured}
      loading={loading}
      disabled={disabled || items.length === 0 || !requiredDate}
      onGenerate={handleGenerate}
    />
  );
}
