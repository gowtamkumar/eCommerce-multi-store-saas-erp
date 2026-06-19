"use client";

import { AiInlineBar } from "@/features/admin/ai/components/AiInlineBar";
import { useAiGenerate } from "@/features/admin/ai/hooks/useAiGenerate";
import type { RequisitionJustificationResult } from "@/features/admin/ai/types/ai-studio";
import toast from "react-hot-toast";
import type { PR } from "../types";
import { buildExistingRequisitionJustificationPayload } from "../lib/buildRequisitionJustificationContext";

interface RequisitionJustificationReadOnlyProps {
  pr: PR;
  onApply?: (result: RequisitionJustificationResult) => void;
}

export function RequisitionJustificationReadOnly({
  pr,
  onApply,
}: RequisitionJustificationReadOnlyProps) {
  const { configured, loading, generateRequisitionJustification } = useAiGenerate();

  const handleGenerate = async () => {
    try {
      const result = await generateRequisitionJustification(
        buildExistingRequisitionJustificationPayload(pr),
      );
      if (!result) return;

      onApply?.(result);
      toast.success("Justification draft generated — copy if updating the PR");
    } catch {
      toast.error("Failed to generate requisition justification");
    }
  };

  return (
    <AiInlineBar
      title="AI justification draft"
      hint="Generate approval-ready reason and line specs from this requisition"
      configured={configured}
      loading={loading}
      disabled={!pr.items?.length}
      onGenerate={handleGenerate}
    />
  );
}
