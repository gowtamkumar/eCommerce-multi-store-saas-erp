"use client";

import { AiInlineBar } from "@/features/admin/ai/components/AiInlineBar";
import { useAiGenerate } from "@/features/admin/ai/hooks/useAiGenerate";
import { useState } from "react";
import toast from "react-hot-toast";
import type { Conversation, Message } from "../types";
import { gatherSupportReplyContext } from "../lib/gatherSupportReplyContext";

const inputClass =
  "w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none";

interface SupportReplyAiAssistProps {
  conversation: Conversation;
  messages: Message[];
  disabled?: boolean;
  onApply: (reply: string) => void;
}

export function SupportReplyAiAssist({
  conversation,
  messages,
  disabled,
  onApply,
}: SupportReplyAiAssistProps) {
  const { configured, loading, generateSupportReply } = useAiGenerate();
  const [orderLookupId, setOrderLookupId] = useState("");

  const handleGenerate = async () => {
    if (!messages.length) {
      toast.error("No messages in this conversation yet");
      return;
    }

    try {
      const context = await gatherSupportReplyContext(
        conversation,
        messages,
        orderLookupId.trim() || undefined,
      );

      const result = await generateSupportReply(context);
      if (!result?.suggestedReply) return;

      onApply(result.suggestedReply);
      toast.success("Suggested reply added — review before sending");
    } catch {
      toast.error("Failed to generate suggested reply");
    }
  };

  return (
    <AiInlineBar
      title="AI suggested reply"
      hint="Uses recent messages, matching FAQs, and customer orders when available"
      configured={configured}
      loading={loading}
      disabled={disabled || !messages.length}
      onGenerate={handleGenerate}
    >
      <input
        type="text"
        value={orderLookupId}
        onChange={(e) => setOrderLookupId(e.target.value)}
        placeholder="Order ID (optional)"
        className={`${inputClass} max-w-[180px]`}
      />
    </AiInlineBar>
  );
}
