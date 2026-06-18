"use client";

import { AiSetupBanner } from "@/features/admin/ai/components/AiChatPanel";
import { Bot, Loader2, Send, Sparkles, Trash2 } from "lucide-react";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { useDashboardCopilot } from "../../hooks/useDashboardCopilot";
import type { DashboardPeriod } from "../../types";

const SUGGESTED_QUESTIONS: Record<DashboardPeriod, string[]> = {
  day: [
    "How are today's sales compared to the prior period?",
    "Which products sold best today?",
    "Do I have any low-stock items to restock?",
  ],
  week: [
    "Summarize this week's revenue and order trends.",
    "Who are my top customers this week?",
    "What's my profit margin this week?",
  ],
  month: [
    "How is this month performing vs last month?",
    "What should I focus on based on current KPIs?",
    "Are there fulfillment bottlenecks right now?",
  ],
};

interface DashboardCopilotProps {
  period: DashboardPeriod;
}

export default function DashboardCopilot({ period }: DashboardCopilotProps) {
  const { configured, loading, messages, sendMessage, clearMessages } = useDashboardCopilot(period);
  const [input, setInput] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading || configured === false) return;
    const value = input;
    setInput("");
    await sendMessage(value);
  };

  const handleSuggested = async (question: string) => {
    if (loading || configured === false) return;
    await sendMessage(question);
  };

  const disabled = configured === false;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200/50 dark:border-slate-800 overflow-hidden shadow-sm">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 px-6 py-5 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-brand-50 dark:bg-brand-950/30 text-brand-600">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">KPI Copilot</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Read-only answers from your live dashboard data
            </p>
          </div>
        </div>
        <span className="inline-flex items-center self-start lg:self-auto px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-slate-100 dark:bg-slate-800 text-slate-500">
          Phase D · No write actions
        </span>
      </div>

      <div className="p-6 space-y-4">
        {configured === false ? <AiSetupBanner configured={configured} /> : null}

        {configured !== false && messages.length === 0 ? (
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_QUESTIONS[period].map((question) => (
              <button
                key={question}
                type="button"
                onClick={() => void handleSuggested(question)}
                disabled={loading || disabled}
                className="px-3 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-300 hover:border-brand-300 hover:text-brand-700 dark:hover:text-brand-300 transition-colors disabled:opacity-50 text-left"
              >
                {question}
              </button>
            ))}
          </div>
        ) : null}

        <div className="flex flex-col h-[360px] rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-950/40 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-200">
              <Bot className="w-4 h-4 text-brand-600" />
              Ask about metrics
            </div>
            {messages.length > 0 ? (
              <button
                type="button"
                onClick={clearMessages}
                className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-red-500"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear
              </button>
            ) : null}
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 px-4">
                <Bot className="w-8 h-8 mb-2 text-brand-500/60" />
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Ask a natural-language KPI question
                </p>
                <p className="text-xs mt-1">
                  e.g. &quot;Why are active orders high?&quot; or &quot;Who bought the most?&quot;
                </p>
                {configured === null ? (
                  <p className="text-xs mt-3 flex items-center gap-2">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Checking AI status...
                  </p>
                ) : null}
              </div>
            ) : (
              messages.map((msg, index) => (
                <div
                  key={`${msg.role}-${index}`}
                  className={`max-w-[90%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${msg.role === "user"
                    ? "ml-auto bg-brand-600 text-white"
                    : "mr-auto bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-100 dark:border-slate-700"
                    }`}
                >
                  {msg.content}
                </div>
              ))
            )}
            {loading ? (
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Loader2 className="w-4 h-4 animate-spin" />
                Analyzing dashboard data...
              </div>
            ) : null}
          </div>

          <form onSubmit={handleSubmit} className="p-3 border-t border-slate-100 dark:border-slate-800 flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={disabled || loading || configured === null}
              placeholder={
                configured === false
                  ? "Configure AI in Settings first"
                  : "Ask about sales, orders, stock, or profit..."
              }
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 outline-none focus:ring-2 focus:ring-brand-500/20 disabled:opacity-60 text-sm"
            />
            <button
              type="submit"
              disabled={disabled || loading || configured === null || !input.trim()}
              className="px-4 py-2.5 rounded-xl bg-brand-600 text-white font-bold disabled:opacity-60"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

        {configured === false ? (
          <p className="text-xs text-slate-500">
            Need reports access and AI enabled.{" "}
            <Link href="/admin/settings/ai" className="font-bold text-brand-600 underline">
              Configure AI
            </Link>
          </p>
        ) : null}
      </div>
    </div>
  );
}
