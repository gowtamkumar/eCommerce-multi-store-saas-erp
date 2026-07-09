"use client";

import { AiInlineBar } from "@/features/admin/ai/components/AiInlineBar";
import { useAiGenerate } from "@/features/admin/ai/hooks/useAiGenerate";
import type { LoyaltyProgramCopyResult } from "@/features/admin/ai/types/ai-studio";
import type { LoyaltyConfig } from "@/services/loyalty";
import toast from "react-hot-toast";

function buildProgramSummary(
    config: LoyaltyConfig,
    formatPrice: (amount: number) => string,
): string {
    const unitAmount = formatPrice(1);
    const lines = [
        `Earn ${config.pointsPerCurrencySpent} points per ${unitAmount} spent.`,
        `Redeem ${config.pointsRequiredPerCurrencyDiscount} points per ${unitAmount} discount.`,
        `Silver tier at ${formatPrice(config.silverTierThreshold)} (${config.silverMultiplier}x), Gold at ${formatPrice(config.goldTierThreshold)} (${config.goldMultiplier}x), Platinum at ${formatPrice(config.platinumTierThreshold)} (${config.platinumMultiplier}x).`,
        `Referral reward: ${config.referralRewardAmount} ${config.referralRewardType === "POINTS" ? "points" : "wallet credit"} when referee spends ${formatPrice(config.refereeMinPurchase)}+.`,
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
    formatPrice: (amount: number) => string;
    onApply: (result: LoyaltyProgramCopyResult) => void;
}

export function LoyaltyProgramAiAssist({ config, formatPrice, onApply }: LoyaltyProgramAiAssistProps) {
    const { configured, loading, generateLoyaltyCopy } = useAiGenerate();

    const handleGenerate = async () => {
        const result = await generateLoyaltyCopy({
            context: "program",
            offerSummary: buildProgramSummary(config, formatPrice),
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
