"use client";

import { useAiGenerate } from "@/features/admin/ai/hooks/useAiGenerate";
import { DiscountType } from "@/lib/enums/discount-type.enum";
import { Loader2, Sparkles } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import toast from "react-hot-toast";

interface CouponCodeAiButtonProps {
  offerSummary?: string;
  description?: string;
  discountType: DiscountType | string;
  amount?: number;
  onSelect: (code: string) => void;
}

function toApiDiscountType(
  discountType: DiscountType | string,
): "percentage" | "fixed" | "free_shipping" | undefined {
  if (discountType === DiscountType.PERCENTAGE || discountType === "percentage") {
    return "percentage";
  }
  if (discountType === DiscountType.FIXED || discountType === "fixed") {
    return "fixed";
  }
  if (discountType === DiscountType.FREE_SHIPPING || discountType === "free_shipping") {
    return "free_shipping";
  }
  return undefined;
}

export function CouponCodeAiButton({
  offerSummary,
  description,
  discountType,
  amount,
  onSelect,
}: CouponCodeAiButtonProps) {
  const { configured, loading, generateCouponCodeSuggestions } = useAiGenerate();
  const [suggestions, setSuggestions] = useState<string[]>([]);

  if (configured === null) return null;

  if (!configured) {
    return (
      <Link
        href="/admin/settings/ai"
        className="text-xs font-semibold text-brand-600 hover:text-brand-700"
      >
        Configure AI
      </Link>
    );
  }

  const handleSuggest = async () => {
    const result = await generateCouponCodeSuggestions({
      offerSummary: offerSummary?.trim() || undefined,
      description: description?.trim() || undefined,
      discountType: toApiDiscountType(discountType),
      amount: amount != null ? Number(amount) : undefined,
      theme: description?.trim() || offerSummary?.trim() || undefined,
      count: 6,
    });

    if (!result?.suggestions?.length) {
      toast.error("No coupon code suggestions returned");
      return;
    }

    setSuggestions(result.suggestions);
    onSelect(result.suggestions[0]);
    toast.success("AI suggestions ready — pick one below");
  };

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleSuggest}
        disabled={loading}
        className="px-4 py-2.5 bg-violet-50 hover:bg-violet-100 dark:bg-violet-950/30 dark:hover:bg-violet-900/40 text-violet-700 dark:text-violet-300 rounded-xl transition-colors flex items-center gap-2 text-sm font-medium border border-violet-200 dark:border-violet-800 disabled:opacity-50"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
        Suggest with AI
      </button>

      {suggestions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {suggestions.map((code) => (
            <button
              key={code}
              type="button"
              onClick={() => onSelect(code)}
              className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-slate-100 hover:bg-brand-50 dark:bg-slate-800 dark:hover:bg-brand-950/30 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700"
            >
              {code}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
