"use client";

import { AiInlineBar } from "@/features/admin/ai/components/AiInlineBar";
import { useAiGenerate } from "@/features/admin/ai/hooks/useAiGenerate";
import type {
  OrderAssistContext,
  OrderAssistResult,
  OrderEmailTemplate,
} from "@/features/admin/ai/types/ai-studio";
import type { Order } from "@/types/order";
import { buildOrderAssistSummary } from "../lib/orderAiContext";

interface OrderAiAssistProps {
  order: Order;
  context: OrderAssistContext;
  emailTemplate?: OrderEmailTemplate;
  onApply: (result: OrderAssistResult) => void;
}

const CONTEXT_COPY: Record<OrderAssistContext, { title: string; hint: string }> = {
  status: {
    title: "AI status explanation",
    hint: "Explain what this order status means and what to do next",
  },
  email: {
    title: "AI customer email",
    hint: "Draft a customer-facing email from order context",
  },
};

export function OrderAiAssist({ order, context, emailTemplate, onApply }: OrderAiAssistProps) {
  const { configured, loading, generateOrderAssist } = useAiGenerate();

  const handleGenerate = async () => {
    const result = await generateOrderAssist({
      context,
      orderSummary: buildOrderAssistSummary(order),
      customerName: order.customerName || "Customer",
      customerEmail: order.customerEmail || undefined,
      orderStatus: order.status,
      paymentStatus: order.paymentStatus,
      emailTemplate: context === "email" ? emailTemplate : undefined,
    });

    if (!result) return;

    onApply(result);
  };

  const copy = CONTEXT_COPY[context];

  return (
    <AiInlineBar
      title={copy.title}
      hint={copy.hint}
      configured={configured}
      loading={loading}
      onGenerate={handleGenerate}
    />
  );
}
