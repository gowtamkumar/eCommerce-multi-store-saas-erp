"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { fetchAPI } from "@/services/api";
import nestApiUrl from "@/lib/api-url";
import { getSession } from "next-auth/react";
import { getClientStoreId } from "@/lib/store-store-id";
import type {
  AiChatMessage,
  AiStatus,
  CampaignCopyResult,
  FaqContentResult,
  PageSeoResult,
  ProductContentResult,
  StoreSeoResult,
} from "../types/ai-studio";

export function useAiStudio() {
  const [status, setStatus] = useState<AiStatus | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [chatLoading, setChatLoading] = useState(false);
  const [productLoading, setProductLoading] = useState(false);
  const [campaignLoading, setCampaignLoading] = useState(false);
  const [faqLoading, setFaqLoading] = useState(false);
  const [pageSeoLoading, setPageSeoLoading] = useState(false);
  const [storeSeoLoading, setStoreSeoLoading] = useState(false);
  const [messages, setMessages] = useState<AiChatMessage[]>([]);
  const [streamingContent, setStreamingContent] = useState("");
  const abortRef = useRef<AbortController | null>(null);

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

  const sendChatStream = async (message: string) => {
    if (!message.trim()) return;

    const userMessage: AiChatMessage = { role: "user", content: message.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setChatLoading(true);
    setStreamingContent("");

    const abort = new AbortController();
    abortRef.current = abort;

    try {
      const session = await getSession();
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (session?.user?.accessToken) {
        headers["Authorization"] = `Bearer ${session.user.accessToken}`;
      }

      const storeId = getClientStoreId();
      if (storeId) {
        headers["x-store-id"] = storeId;
      }

      const activeBranchId = localStorage.getItem("activeBranchId");
      if (activeBranchId) {
        headers["x-branch-id"] = activeBranchId;
      }

      const response = await fetch(`${nestApiUrl}/ai/chat/stream`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          message: userMessage.content,
          history: messages,
        }),
        signal: abort.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let buffer = "";
      let fullReply = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const payload = line.slice(6).trim();
          if (!payload) continue;

          try {
            const chunk = JSON.parse(payload);

            if (chunk.type === "token") {
              fullReply += chunk.content;
              setStreamingContent(fullReply);
            } else if (chunk.type === "done") {
              setMessages((prev) => [
                ...prev,
                { role: "assistant", content: fullReply },
              ]);
              setStreamingContent("");
            } else if (chunk.type === "error") {
              toast.error(chunk.message || "Stream error");
              setMessages((prev) => prev.slice(0, -1));
              setStreamingContent("");
            }
          } catch {
            // skip malformed JSON
          }
        }
      }

      if (fullReply && !messages.some((m) => m.content === fullReply)) {
        setMessages((prev) => {
          if (prev.at(-1)?.role === "assistant" && prev.at(-1)?.content === fullReply) {
            return prev;
          }
          return [...prev, { role: "assistant", content: fullReply }];
        });
      }
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      toast.error("AI chat failed. Check your AI configuration in Settings.");
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setChatLoading(false);
      setStreamingContent("");
      abortRef.current = null;
    }
  };

  const cancelStream = () => {
    abortRef.current?.abort();
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

  const generateFaq = async (payload: {
    topic: string;
    category?: string;
    tone?: string;
  }): Promise<FaqContentResult | null> => {
    setFaqLoading(true);
    try {
      const res = await fetchAPI("/ai/generate/faq", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      toast.success("FAQ generated");
      return res.data;
    } catch {
      toast.error("Failed to generate FAQ");
      return null;
    } finally {
      setFaqLoading(false);
    }
  };

  const generatePageSeo = async (payload: {
    pageTitle: string;
    keywords?: string;
    tone?: string;
  }): Promise<PageSeoResult | null> => {
    setPageSeoLoading(true);
    try {
      const res = await fetchAPI("/ai/generate/page-seo", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      toast.success("Page SEO generated");
      return res.data;
    } catch {
      toast.error("Failed to generate page SEO");
      return null;
    } finally {
      setPageSeoLoading(false);
    }
  };

  const generateStoreSeo = async (payload: {
    brandName: string;
    keywords?: string;
    existingDescription?: string;
    tone?: string;
  }): Promise<StoreSeoResult | null> => {
    setStoreSeoLoading(true);
    try {
      const res = await fetchAPI("/ai/generate/store-seo", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      toast.success("Store SEO generated");
      return res.data;
    } catch {
      toast.error("Failed to generate store SEO");
      return null;
    } finally {
      setStoreSeoLoading(false);
    }
  };

  const clearChat = () => setMessages([]);

  return {
    status,
    loadingStatus,
    chatLoading,
    productLoading,
    campaignLoading,
    faqLoading,
    pageSeoLoading,
    storeSeoLoading,
    messages,
    streamingContent,
    sendChat,
    sendChatStream,
    cancelStream,
    clearChat,
    generateProductContent,
    generateCampaignCopy,
    generateFaq,
    generatePageSeo,
    generateStoreSeo,
    refreshStatus: loadStatus,
  };
}
