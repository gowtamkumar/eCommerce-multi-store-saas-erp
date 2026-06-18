"use client";

import { AiInlineBar } from "@/features/admin/ai/components/AiInlineBar";
import { useAiGenerate } from "@/features/admin/ai/hooks/useAiGenerate";
import type {
  AbandonedCartMessageResult,
  AbandonedCartMessageTemplate,
} from "@/features/admin/ai/types/ai-studio";
import { useSettings } from "@/hooks/SettingsContext";
import type { CartSummary } from "../types";
import { buildAbandonedCartMessagePayload } from "../lib/buildAbandonedCartContext";

interface CartAbandonedMessageAiAssistProps {
  cart: CartSummary;
  messageTemplate: AbandonedCartMessageTemplate;
  onApply: (result: AbandonedCartMessageResult) => void;
}

export function CartAbandonedMessageAiAssist({
  cart,
  messageTemplate,
  onApply,
}: CartAbandonedMessageAiAssistProps) {
  const { settings } = useSettings();
  const { configured, loading, generateAbandonedCartMessage } = useAiGenerate();

  const handleGenerate = async () => {
    const result = await generateAbandonedCartMessage(
      buildAbandonedCartMessagePayload(
        cart,
        messageTemplate,
        settings?.brandName,
      ),
    );

    if (!result) return;
    onApply(result);
  };

  return (
    <AiInlineBar
      title="AI abandoned cart message"
      hint="Draft email and SMS recovery copy from cart contents — send manually"
      configured={configured}
      loading={loading}
      onGenerate={handleGenerate}
    />
  );
}
