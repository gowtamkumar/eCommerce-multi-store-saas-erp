"use client";

import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { fetchAPI } from "@/services/api";
import type { AiChatMessage } from "@/features/admin/ai/types/ai-studio";
import type { DashboardPeriod } from "@/features/admin/dashboard/types";

export function useDashboardCopilot(period: DashboardPeriod) {
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<AiChatMessage[]>([]);

  const checkStatus = useCallback(async () => {
    try {
      const res = await fetchAPI("/ai/status");
      setConfigured(!!res.data?.configured);
    } catch {
      setConfigured(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      void checkStatus();
    }, 0);
    return () => clearTimeout(timer);
  }, [checkStatus]);

  const sendMessage = async (message: string) => {
    if (!message.trim()) return;

    const userMessage: AiChatMessage = { role: "user", content: message.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      const res = await fetchAPI("/ai/copilot/dashboard", {
        method: "POST",
        body: JSON.stringify({
          message: userMessage.content,
          history: messages,
          period,
        }),
      });

      const reply = res.data?.reply || "No response";
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch {
      toast.error("Copilot failed. Check AI configuration and reports access.");
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  };

  const clearMessages = () => setMessages([]);

  return {
    configured,
    loading,
    messages,
    sendMessage,
    clearMessages,
    refreshStatus: checkStatus,
  };
}
