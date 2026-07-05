"use client";

import { AiInlineBar } from "@/features/admin/ai/components/AiInlineBar";
import { useAiGenerate } from "@/features/admin/ai/hooks/useAiGenerate";
import toast from "react-hot-toast";
import type { LoyaltyRuleType } from "../types";

const RULE_TYPE_LABELS: Record<LoyaltyRuleType, string> = {
  CATEGORY_MULTIPLIER: "Category Multiplier",
  MIN_SPEND_BONUS: "Min Spend Bonus",
  WEEKEND_MULTIPLIER: "Weekend Multiplier",
};

interface LoyaltyRuleAiAssistProps {
  ruleType: LoyaltyRuleType;
  value: number;
  categoryId?: string;
  minSpend?: number;
  onApply: (name: string) => void;
}

function buildRuleSummary({
  ruleType,
  value,
  categoryId,
  minSpend,
}: Omit<LoyaltyRuleAiAssistProps, "onApply">): string {
  const parts = [`Type: ${RULE_TYPE_LABELS[ruleType]}`];

  if (ruleType === "MIN_SPEND_BONUS") {
    parts.push(`Bonus: ${value} points`, `Min spend: $${minSpend ?? 0}`);
  } else {
    parts.push(`Multiplier: ${value}x`);
  }

  if (ruleType === "CATEGORY_MULTIPLIER" && categoryId) {
    parts.push(`Category ID: ${categoryId}`);
  }

  return parts.join(". ");
}

export function LoyaltyRuleAiAssist({
  ruleType,
  value,
  categoryId,
  minSpend,
  onApply,
}: LoyaltyRuleAiAssistProps) {
  const { configured, loading, generateLoyaltyCopy } = useAiGenerate();

  const handleGenerate = async () => {
    const result = await generateLoyaltyCopy({
      context: "rule",
      ruleType: RULE_TYPE_LABELS[ruleType],
      offerSummary: buildRuleSummary({ ruleType, value, categoryId, minSpend }),
    });

    if (!result || !("name" in result) || !result.name.trim()) return;

    onApply(result.name.trim());
    toast.success("AI suggested rule name applied");
  };

  return (
    <AiInlineBar
      title="AI rule name"
      hint="Suggest a clear admin-facing name from the rule type and parameters"
      configured={configured}
      loading={loading}
      onGenerate={handleGenerate}
    />
  );
}
