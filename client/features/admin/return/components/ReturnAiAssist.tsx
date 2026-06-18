"use client";

import { AiInlineBar } from "@/features/admin/ai/components/AiInlineBar";
import { useAiGenerate } from "@/features/admin/ai/hooks/useAiGenerate";
import type { ReturnAssistResult, ReturnLetterTemplate } from "@/features/admin/ai/types/ai-studio";
import type { ReturnAssistInput } from "../lib/buildReturnAssistSummary";
import { buildReturnAssistSummary } from "../lib/buildReturnAssistSummary";

interface ReturnAiAssistProps {
  returnRequest: ReturnAssistInput;
  letterTemplate: ReturnLetterTemplate;
  onApply: (result: ReturnAssistResult) => void;
}

export function ReturnAiAssist({
  returnRequest,
  letterTemplate,
  onApply,
}: ReturnAiAssistProps) {
  const { configured, loading, generateReturnAssist } = useAiGenerate();

  const handleGenerate = async () => {
    const customerName = returnRequest.order?.customerName || "Customer";
    const customerEmail =
      returnRequest.user?.email || returnRequest.order?.customerEmail || undefined;

    const result = await generateReturnAssist({
      returnSummary: buildReturnAssistSummary(returnRequest),
      customerName,
      customerEmail,
      returnStatus: returnRequest.status,
      returnType: returnRequest.returnType,
      refundMethod: returnRequest.refundMethod || undefined,
      letterTemplate,
    });

    if (!result) return;

    onApply(result);
  };

  return (
    <AiInlineBar
      title="AI refund explanation letter"
      hint="Draft a customer-facing letter explaining the return or refund status"
      configured={configured}
      loading={loading}
      onGenerate={handleGenerate}
    />
  );
}
