"use client";

import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { fetchAPI } from "@/services/api";
import type {
  AiChatMessage,
  AiStatus,
  CampaignCopyResult,
  ProductContentResult,
} from "../types/ai-studio";

export function useAiStudio() {
  const [status, setStatus] = useState<AiStatus | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [chatLoading, setChatLoading] = useState(false);
  const [productLoading, setProductLoading] = useState(false);
  const [campaignLoading, setCampaignLoading] = useState(false);
  const [messages, setMessages] = useState<AiChatMessage[]>([]);

  const loadStatus = useCallback(async () => {
    try {
      setLoadingStatus(true);
      const res = await fetchAPI("/ai/status");
      setStatus(res.data || null);
    } catch {
      toast.error("Failed to load AI status");
    } finally {
      setLoadingStatus(false);
    }
  }, []);

  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  const sendChat = async (message: string) => {
    if (!message.trim()) return;

    const userMessage: AiChatMessage = { role: "user", content: message.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setChatLoading(true);

    try {
      const res = await fetchAPI("/ai/chat", {
        method: "POST",
        body: JSON.stringify({
          message: userMessage.content,
          history: messages,
        }),
      });

      const reply = res.data?.reply || "No response";
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch {
      toast.error("AI chat failed. Check your AI configuration in Settings.");
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setChatLoading(false);
    }
  };

  const generateProductContent = async (payload: {
    productName: string;
    category?: string;
    keywords?: string;
    existingDescription?: string;
    tone?: string;
  }): Promise<ProductContentResult | null> => {
    setProductLoading(true);
    try {
      const res = await fetchAPI("/ai/generate/product-content", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      toast.success("Product content generated");
      return res.data;
    } catch {
      toast.error("Failed to generate product content");
      return null;
    } finally {
      setProductLoading(false);
    }
  };

  const generateCampaignCopy = async (payload: {
    campaignName: string;
    audience?: string;
    offerDetails?: string;
    channel?: "email" | "sms" | "both" | "push";
    tone?: string;
  }): Promise<CampaignCopyResult | null> => {
    setCampaignLoading(true);
    try {
      const res = await fetchAPI("/ai/generate/campaign-copy", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      toast.success("Campaign copy generated");
      return res.data;
    } catch {
      toast.error("Failed to generate campaign copy");
      return null;
    } finally {
      setCampaignLoading(false);
    }
  };

  const clearChat = () => setMessages([]);

  return {
    status,
    loadingStatus,
    chatLoading,
    productLoading,
    campaignLoading,
    messages,
    sendChat,
    clearChat,
    generateProductContent,
    generateCampaignCopy,
    refreshStatus: loadStatus,
  };
}
