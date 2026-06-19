"use client";

import { useAiGenerate } from "@/features/admin/ai/hooks/useAiGenerate";
import { Loader2, Tags } from "lucide-react";
import toast from "react-hot-toast";
import type { Message } from "../types";
import { buildConversationSummary } from "../lib/buildSupportReplyContext";

const MAX_VISITOR_MESSAGES = 15;

interface SupportIntentTagsAssistProps {
  messages: Message[];
  disabled?: boolean;
  active: boolean;
  onToggle: (next: boolean) => void;
  onTagsUpdated: (tagsByMessageId: Record<string, string[]>) => void;
}

export function SupportIntentTagsAssist({
  messages,
  disabled,
  active,
  onToggle,
  onTagsUpdated,
}: SupportIntentTagsAssistProps) {
  const { configured, loading, generateSupportMessageIntents } = useAiGenerate();

  const handleToggle = async () => {
    if (active) {
      onToggle(false);
      onTagsUpdated({});
      return;
    }

    const visitorMessages = messages
      .filter((m) => m.senderType === "VISITOR")
      .slice(-MAX_VISITOR_MESSAGES);

    if (!visitorMessages.length) {
      toast.error("No visitor messages to tag");
      return;
    }

    try {
      const result = await generateSupportMessageIntents({
        messages: visitorMessages.map((m) => ({
          messageId: m.id,
          text: m.message,
        })),
        conversationSummary: buildConversationSummary(messages),
      });

      if (!result) return;

      const tagsByMessageId: Record<string, string[]> = {};
      for (const row of result.messageIntents) {
        if (row.intentTags.length > 0) {
          tagsByMessageId[row.messageId] = row.intentTags;
        }
      }

      onTagsUpdated(tagsByMessageId);
      onToggle(true);
      toast.success("Intent tags applied to visitor messages");
    } catch {
      toast.error("Failed to generate intent tags");
    }
  };

  if (configured === null) return null;

  return (
    <button
      type="button"
      onClick={() => void handleToggle()}
      disabled={!configured || disabled || loading || !messages.some((m) => m.senderType === "VISITOR")}
      className={`inline-flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-full border transition-colors disabled:opacity-50 ${
        active
          ? "border-violet-300 dark:border-violet-700 text-violet-800 dark:text-violet-200 bg-violet-100 dark:bg-violet-950/50"
          : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/40 hover:bg-slate-100 dark:hover:bg-slate-800"
      }`}
      title={configured ? "Optional AI intent labels on visitor messages" : "Configure AI in Settings"}
    >
      {loading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : (
        <Tags className="w-3.5 h-3.5" />
      )}
      {active ? "Hide intents" : "Intent tags"}
    </button>
  );
}
