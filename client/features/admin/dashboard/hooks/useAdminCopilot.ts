"use client";

import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { fetchAPI } from "@/services/api";

export interface AdminCopilotMessage {
  role: "user" | "assistant";
  content: string;
  toolsUsed?: Array<{ tool: string; args?: Record<string, unknown> }>;
}

export function useAdminCopilot() {
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<AdminCopilotMessage[]>([]);

  const checkStatus = useCallback(async () => {
    try {
      const res = await fetchAPI("/ai/status");
      setConfigured(!!res.data?.configured);
    } catch {
      setConfigured(false);
    }
  }, []);

  useEffect(() => {
    void checkStatus();
  }, [checkStatus]);

  const sendMessage = async (message: string) => {
    if (!message.trim()) return;

    const userMessage: AdminCopilotMessage = { role: "user", content: message.trim() };
    const history = messages.map((item) => ({ role: item.role, content: item.content }));
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      const res = await fetchAPI("/ai/copilot/admin", {
        method: "POST",
        body: JSON.stringify({
          message: userMessage.content,
          history,
        }),
      });

      const reply = res.data?.reply || "No response";
      const toolsUsed = res.data?.toolsUsed as AdminCopilotMessage["toolsUsed"];
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: reply, toolsUsed: toolsUsed?.length ? toolsUsed : undefined },
      ]);
    } catch {
      toast.error("Admin copilot failed. Check AI configuration.");
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
