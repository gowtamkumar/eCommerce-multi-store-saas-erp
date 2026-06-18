"use client";

import { AiInlineBar } from "@/features/admin/ai/components/AiInlineBar";
import { useAiGenerate } from "@/features/admin/ai/hooks/useAiGenerate";
import type { LeadFollowUpIntent, LeadFollowUpResult } from "@/features/admin/ai/types/ai-studio";
import type { LeadMessage } from "../type";

const INTENT_LABELS: Record<LeadFollowUpIntent, string> = {
  welcome: "Welcome / thank-you",
  follow_up: "Follow-up reply",
  nurture: "Nurture sequence",
  conversion: "Conversion nudge",
};

interface LeadFollowUpAiAssistProps {
  lead: LeadMessage;
  intent: LeadFollowUpIntent;
  brandName?: string;
  onApply: (result: LeadFollowUpResult) => void;
}

export function LeadFollowUpAiAssist({
  lead,
  intent,
  brandName,
  onApply,
}: LeadFollowUpAiAssistProps) {
  const { configured, loading, generateLeadFollowUp } = useAiGenerate();

  const handleGenerate = async () => {
    const result = await generateLeadFollowUp({
      leadName: lead.name || "there",
      leadEmail: lead.email,
      subject: lead.subject || undefined,
      message: lead.message || undefined,
      status: lead.status,
      intent,
      brandName: brandName?.trim() || undefined,
    });

    if (!result) return;

    onApply(result);
  };

  return (
    <AiInlineBar
      title="AI follow-up email"
      hint={`Draft a ${INTENT_LABELS[intent].toLowerCase()} for ${lead.email}`}
      configured={configured}
      loading={loading}
      onGenerate={handleGenerate}
    />
  );
}
