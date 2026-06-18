"use client";

import { AiInlineBar } from "@/features/admin/ai/components/AiInlineBar";
import { useAiGenerate } from "@/features/admin/ai/hooks/useAiGenerate";
import type { CustomerProfileResult } from "@/features/admin/ai/types/ai-studio";
import toast from "react-hot-toast";
import type { User } from "../type";
import { gatherCustomerProfileContext } from "../lib/gatherCustomerProfileContext";

interface CustomerProfileAiAssistProps {
  user: User;
  onApply: (result: CustomerProfileResult) => void;
}

export function CustomerProfileAiAssist({ user, onApply }: CustomerProfileAiAssistProps) {
  const { configured, loading, generateCustomerProfile } = useAiGenerate();

  const handleGenerate = async () => {
    try {
      const context = await gatherCustomerProfileContext(user);
      const result = await generateCustomerProfile(context);
      if (!result) return;

      onApply(result);
      toast.success("Profile insights generated — read-only summary");
    } catch {
      toast.error("Failed to generate customer profile insights");
    }
  };

  return (
    <AiInlineBar
      title="AI profile insights"
      hint="Read-only support summary and segment labels from profile, orders, returns, wallet, and loyalty"
      configured={configured}
      loading={loading}
      onGenerate={handleGenerate}
    />
  );
}
