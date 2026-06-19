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

export function useProductQa(productSlug: string) {
  const [available, setAvailable] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ProductQaMessage[]>([]);

  const checkAvailability = useCallback(async () => {
    try {
      const res = await fetchAPI("/products/storefront-ai/status");
      setAvailable(!!res.data?.productQaAvailable);
    } catch {
      setAvailable(false);
    }
  }, []);

  useEffect(() => {
    void checkAvailability();
  }, [checkAvailability]);

  const askQuestion = async (question: string): Promise<ProductQaResult | null> => {
    const trimmed = question.trim();
    if (!trimmed) return null;

    setLoading(true);
    try {
      const res = await fetchAPI(`/products/slug/${encodeURIComponent(productSlug)}/ask`, {
        method: "POST",
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
    } catch {
      toast.error("Product Q&A is unavailable. The store may need AI configured.");
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
