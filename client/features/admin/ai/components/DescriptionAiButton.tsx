"use client";

import { useAiGenerate } from "@/features/admin/ai/hooks/useAiGenerate";
import { Loader2, Sparkles } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

interface DescriptionAiButtonProps {
  name: string;
  offerSummary?: string;
  context: "coupon" | "promotion";
  onApply: (description: string) => void;
}

export function DescriptionAiButton({
  name,
  offerSummary,
  context,
  onApply,
}: DescriptionAiButtonProps) {
  const { configured, loading, generateMarketingDescription } = useAiGenerate();

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

  const handleGenerate = async () => {
    if (!name.trim()) {
      toast.error(context === "coupon" ? "Enter a coupon code first" : "Enter a promotion name first");
      return;
    }

    const result = await generateMarketingDescription({
      name: name.trim(),
      offerSummary: offerSummary?.trim() || undefined,
      context,
    });

    if (!result?.description) return;

    onApply(result.description);
    toast.success("AI description applied");
  };

  return (
    <button
      type="button"
      onClick={handleGenerate}
      disabled={loading || !name.trim()}
      className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 hover:text-brand-700 disabled:opacity-50"
    >
      {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
      Generate with AI
    </button>
  );
}
