"use client";

import { useAiGenerate } from "@/features/admin/ai/hooks/useAiGenerate";
import type { SupportConversationSummaryResult } from "@/features/admin/ai/types/ai-studio";
import { Copy, Loader2, Sparkles, X } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import type { Conversation, Message } from "../types";
import { gatherSupportReplyContext } from "../lib/gatherSupportReplyContext";

interface SupportHandoffSummaryAssistProps {
  conversation: Conversation;
  messages: Message[];
  disabled?: boolean;
}

function formatHandoffForClipboard(result: SupportConversationSummaryResult): string {
  const sections = [
    `Handoff summary\n${result.handoffSummary}`,
    result.keyPoints.length
      ? `Key points\n${result.keyPoints.map((p) => `• ${p}`).join("\n")}`
      : "",
    result.pendingVisitorRequests.length
      ? `Pending visitor requests\n${result.pendingVisitorRequests.map((p) => `• ${p}`).join("\n")}`
      : "",
    result.suggestedNextSteps.length
      ? `Suggested next steps\n${result.suggestedNextSteps.map((p) => `• ${p}`).join("\n")}`
      : "",
  ].filter(Boolean);

  return sections.join("\n\n");
}

export function SupportHandoffSummaryAssist({
  conversation,
  messages,
  disabled,
}: SupportHandoffSummaryAssistProps) {
  const { configured, loading, generateSupportConversationSummary } = useAiGenerate();
  const [open, setOpen] = useState(false);
  const [summary, setSummary] = useState<SupportConversationSummaryResult | null>(null);

  const handleGenerate = async () => {
    if (!messages.length) {
      toast.error("No messages in this conversation yet");
      return;
    }

    try {
      const context = await gatherSupportReplyContext(conversation, messages);
      const result = await generateSupportConversationSummary(context);
      if (!result) return;

      setSummary(result);
      setOpen(true);
      toast.success("Handoff summary ready");
    } catch {
      toast.error("Failed to generate handoff summary");
    }
  };

  const copyAll = async () => {
    if (!summary) return;
    await navigator.clipboard.writeText(formatHandoffForClipboard(summary));
    toast.success("Copied handoff notes");
  };

  if (configured === null) return null;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => void handleGenerate()}
        disabled={!configured || disabled || loading || !messages.length}
        className="inline-flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-full border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-950/60 disabled:opacity-50 transition-colors"
        title={configured ? "Summarize thread for agent handoff" : "Configure AI in Settings"}
      >
        {loading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <Sparkles className="w-3.5 h-3.5" />
        )}
        Handoff summary
      </button>

      {open && summary ? (
        <div className="absolute right-0 top-full mt-2 z-20 w-[min(100vw-2rem,24rem)] rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl p-4 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-bold text-slate-900 dark:text-white">Agent handoff notes</p>
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => void copyAll()}
                className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                title="Copy all"
              >
                <Copy className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <p className="text-sm text-slate-700 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
            {summary.handoffSummary}
          </p>

          {summary.keyPoints.length > 0 ? (
            <HandoffList title="Key points" items={summary.keyPoints} />
          ) : null}

          {summary.pendingVisitorRequests.length > 0 ? (
            <HandoffList title="Pending requests" items={summary.pendingVisitorRequests} />
          ) : null}

          {summary.suggestedNextSteps.length > 0 ? (
            <HandoffList title="Next steps" items={summary.suggestedNextSteps} />
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function HandoffList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{title}</p>
      <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-1 list-disc pl-4">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
