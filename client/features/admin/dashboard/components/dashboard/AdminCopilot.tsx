"use client";

import { AiSetupBanner } from "@/features/admin/ai/components/AiChatPanel";
import { Bot, Loader2, Send, Sparkles, Trash2, Wrench } from "lucide-react";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { useAdminCopilot } from "../../hooks/useAdminCopilot";

const SUGGESTED_QUESTIONS = [
  "Show my 5 most recent pending orders",
  "Which products are low on stock?",
  "Summarize this month's dashboard KPIs",
  "Look up stock for SKU in my catalog",
];

export default function AdminCopilot() {
  const { configured, loading, messages, sendMessage, clearMessages } = useAdminCopilot();
  const [input, setInput] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading || configured === false) return;
    const value = input;
    setInput("");
    await sendMessage(value);
  };

  const disabled = configured === false;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200/50 dark:border-slate-800 overflow-hidden shadow-sm">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 px-6 py-5 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-violet-100 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">Admin Copilot</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Read-only tools: orders, stock, low-stock list, dashboard KPIs
            </p>
          </div>
        </div>
        <span className="inline-flex items-center self-start lg:self-auto px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-slate-100 dark:bg-slate-800 text-slate-500">
          No write actions
        </span>
      </div>

      <div className="p-6 space-y-4">
        {configured === false ? (
          <AiSetupBanner configured={false} />
        ) : (
          <>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_QUESTIONS.map((question) => (
                <button
                  key={question}
                  type="button"
                  disabled={loading || disabled}
                  onClick={() => void sendMessage(question)}
                  className="text-left text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50"
                >
                  {question}
                </button>
              ))}
            </div>

            <div className="min-h-[220px] max-h-[360px] overflow-y-auto space-y-3 rounded-2xl border border-slate-100 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-900/40">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 py-8">
                  <Sparkles className="w-8 h-8 mb-2 text-violet-500/60" />
                  <p className="font-semibold text-slate-700 dark:text-slate-300">Ask across orders and inventory</p>
                  <p className="text-sm mt-1">The copilot calls live read-only tools before answering.</p>
                </div>
              ) : (
                messages.map((message, index) => (
                  <div
                    key={`${message.role}-${index}`}
                    className={`rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap ${
                      message.role === "user"
                        ? "bg-brand-600 text-white ml-8"
                        : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 mr-8 border border-slate-100 dark:border-slate-700"
                    }`}
                  >
                    {message.content}
                    {message.toolsUsed?.length ? (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {message.toolsUsed.map((tool) => (
                          <span
                            key={`${tool.tool}-${index}`}
                            className="inline-flex items-center gap-1 rounded-full bg-violet-100 dark:bg-violet-900/40 text-violet-800 dark:text-violet-200 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
                          >
                            <Wrench className="w-3 h-3" />
                            {tool.tool}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>
                ))
              )}
            </div>

            <form onSubmit={(e) => void handleSubmit(e)} className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={loading || disabled}
                placeholder="Ask about orders, stock, or KPIs..."
                className="flex-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-violet-500/20"
              />
              <button
                type="submit"
                disabled={loading || disabled || !input.trim()}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Ask
              </button>
              {messages.length > 0 ? (
                <button
                  type="button"
                  onClick={clearMessages}
                  className="inline-flex items-center gap-1 px-3 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              ) : null}
            </form>

            <p className="text-xs text-slate-500">
              Configure AI in{" "}
              <Link href="/admin/settings?tab=ai" className="font-semibold text-brand-600 hover:underline">
                Settings → AI
              </Link>
              . Answers use tool results only — no automatic changes.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
