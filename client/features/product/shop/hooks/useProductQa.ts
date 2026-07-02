"use client";

import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { fetchAPI } from "@/services/api";

export interface ProductQaMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ProductQaResult {
  answer: string;
  suggestedFollowUps: string[];
}

export function useProductQa(productSlug: string, storeId?: string) {
  const [available, setAvailable] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ProductQaMessage[]>([]);

  const checkAvailability = useCallback(async () => {
    if (!storeId) {
      setAvailable(null);
      return;
    }

    try {
      const res = await fetchAPI("/products/storefront-ai/status", { storeId });
      setAvailable(!!res.data?.productQaAvailable);
    } catch (error) {
      console.error("Product Q&A status check failed:", error);
      setAvailable(false);
    }
  }, [storeId]);

  useEffect(() => {
    void checkAvailability();
  }, [checkAvailability]);

  const askQuestion = async (question: string): Promise<ProductQaResult | null> => {
    const trimmed = question.trim();
    if (!trimmed || !storeId) return null;

    setLoading(true);
    try {
      const res = await fetchAPI(`/products/slug/${encodeURIComponent(productSlug)}/ask`, {
        method: "POST",
        storeId,
        body: JSON.stringify({
          question: trimmed,
          conversationHistory: messages.slice(-6),
        }),
      });

      const result = res.data as ProductQaResult | undefined;
      if (!result?.answer) {
        toast.error("Could not get an answer right now.");
        return null;
      }

      setMessages((prev) => [
        ...prev,
        { role: "user", content: trimmed },
        { role: "assistant", content: result.answer },
      ]);

      return result;
    } catch (error) {
      console.error("Product Q&A failed:", error);
      toast.error(
        error instanceof Error ? error.message : "Product Q&A is unavailable.",
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
    askQuestion,
    resetConversation,
  };
}
