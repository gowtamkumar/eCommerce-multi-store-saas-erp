"use client";

import { AiInlineBar } from "@/features/admin/ai/components/AiInlineBar";
import { useAiGenerate } from "@/features/admin/ai/hooks/useAiGenerate";
import type { LoyaltyProgramCopyResult } from "@/features/admin/ai/types/ai-studio";
import type { LoyaltyConfig } from "@/services/loyalty";
import toast from "react-hot-toast";

function buildProgramSummary(config: LoyaltyConfig): string {
  const lines = [
    `Earn ${config.pointsPerCurrencySpent} points per $1 spent.`,
    `Redeem ${config.pointsRequiredPerCurrencyDiscount} points per $1 discount.`,
    `Silver tier at $${config.silverTierThreshold} (${config.silverMultiplier}x), Gold at $${config.goldTierThreshold} (${config.goldMultiplier}x), Platinum at $${config.platinumTierThreshold} (${config.platinumMultiplier}x).`,
    `Referral reward: ${config.referralRewardAmount} ${config.referralRewardType === "POINTS" ? "points" : "wallet credit"} when referee spends $${config.refereeMinPurchase}+.`,
  ];

  if (config.pointsExpireAfterDays) {
    lines.push(`Points expire after ${config.pointsExpireAfterDays} days.`);
  } else {
    lines.push("Points never expire.");
  }

  return lines.join(" ");
}

interface LoyaltyProgramAiAssistProps {
  config: LoyaltyConfig;
  onApply: (result: LoyaltyProgramCopyResult) => void;
}

export function LoyaltyProgramAiAssist({ config, onApply }: LoyaltyProgramAiAssistProps) {
  const { configured, loading, generateLoyaltyCopy } = useAiGenerate();

  const handleGenerate = async () => {
    const result = await generateLoyaltyCopy({
      context: "program",
      offerSummary: buildProgramSummary(config),
    });

    if (!result || !("programDescription" in result)) return;

    onApply(result);
    toast.success("AI copy applied to program description & referral message");
  };

  return (
    <AiInlineBar
      title="AI loyalty program copy"
      hint="Generate customer-facing program description and referral invite text from your rules"
      configured={configured}
      loading={loading}
      onGenerate={handleGenerate}
    />
  );
}
