"use client";

import { AiInlineBar } from "@/features/admin/ai/components/AiInlineBar";
import { useAiGenerate } from "@/features/admin/ai/hooks/useAiGenerate";
import type { CampaignCopyResult } from "@/features/admin/ai/types/ai-studio";
import { useState } from "react";
import toast from "react-hot-toast";
import { CampaignType } from "../types";

interface CampaignAiAssistProps {
  campaignName: string;
  channel: CampaignType;
  onApply: (result: CampaignCopyResult) => void;
}

const CHANNEL_MAP: Record<CampaignType, "email" | "sms" | "push"> = {
  [CampaignType.EMAIL]: "email",
  [CampaignType.SMS]: "sms",
  [CampaignType.PUSH]: "push",
};

export function CampaignAiAssist({ campaignName, channel, onApply }: CampaignAiAssistProps) {
  const { configured, loading, generateCampaignCopy } = useAiGenerate();
  const [offerDetails, setOfferDetails] = useState("");

  const handleGenerate = async () => {
    if (!campaignName.trim()) {
      toast.error("Enter a campaign name first");
      return;
    }

    const result = await generateCampaignCopy({
      campaignName: campaignName.trim(),
      offerDetails: offerDetails.trim() || undefined,
      channel: CHANNEL_MAP[channel],
    });

    if (!result) return;

    onApply(result);
    toast.success("AI copy applied to campaign fields");
  };

  return (
    <AiInlineBar
      title="AI campaign copy"
      hint="Generate subject, body, or message text from your campaign name"
      configured={configured}
      loading={loading}
      disabled={!campaignName.trim()}
      onGenerate={handleGenerate}
    >
      <input
        type="text"
        value={offerDetails}
        onChange={(e) => setOfferDetails(e.target.value)}
        disabled={loading}
        placeholder="Offer details (optional)"
        className="flex-1 min-w-[140px] px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm outline-none"
      />
    </AiInlineBar>
  );
}
