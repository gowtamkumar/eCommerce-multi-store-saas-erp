"use client";

import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { fetchAPI } from "@/services/api";

export interface ShoppingAssistantMessage {
  role: "user" | "assistant";
  content: string;
  productLinks?: Array<{ name: string; slug: string }>;
}

export interface ShoppingAssistantReply {
  answer: string;
  suggestedFollowUps: string[];
  productLinks: Array<{ name: string; slug: string }>;
}

export function useShoppingAssistant(tenantId?: string, brandName?: string) {
  const [available, setAvailable] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ShoppingAssistantMessage[]>([]);

  const checkAvailability = useCallback(async () => {
    if (!tenantId) {
      setAvailable(null);
      return;
    }

    try {
      const res = await fetchAPI("/products/storefront-ai/status", { tenantId });
      setAvailable(!!res.data?.shoppingAssistantAvailable);
    } catch (error) {
      console.error("Shopping assistant status check failed:", error);
      setAvailable(false);
    }
  }, [tenantId]);

  useEffect(() => {
    void checkAvailability();
  }, [checkAvailability]);

  const sendMessage = async (message: string): Promise<ShoppingAssistantReply | null> => {
    const trimmed = message.trim();
    if (!trimmed || !tenantId) return null;

    setLoading(true);
    try {
      const res = await fetchAPI("/products/storefront-ai/chat", {
        method: "POST",
        tenantId,
        body: JSON.stringify({
          message: trimmed,
          brandName: brandName || undefined,
          conversationHistory: messages.slice(-8).map(({ role, content }) => ({ role, content })),
        }),
      });

      const result = res.data as ShoppingAssistantReply | undefined;
      if (!result?.answer) {
        toast.error("Could not get a reply right now.");
        return null;
      }

      setMessages((prev) => [
        ...prev,
        { role: "user", content: trimmed },
        {
          role: "assistant",
          content: result.answer,
          productLinks: result.productLinks || [],
        },
      ]);

      return result;
    } catch (error) {
      console.error("Shopping assistant chat failed:", error);
      toast.error(
        error instanceof Error ? error.message : "Shopping assistant is unavailable.",
      );
      return null;
    } finally {
      setLoading(false);
    }
  };

  const resetConversation = () => setMessages([]);

  return {
    available,
    loading,
    messages,
    sendMessage,
    resetConversation,
  };
}
