"use client";

import Link from "next/link";
import { Bot, Loader2, Send, Trash2 } from "lucide-react";
import { FormEvent, useState } from "react";

interface AiChatPanelProps {
  messages: Array<{ role: "user" | "assistant"; content: string }>;
  loading: boolean;
  disabled: boolean;
  onSend: (message: string) => Promise<void>;
  onClear: () => void;
}

export function AiChatPanel({ messages, loading, disabled, onSend, onClear }: AiChatPanelProps) {
  const [input, setInput] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading || disabled) return;
    const value = input;
    setInput("");
    await onSend(value);
  };

  return (
    <div className="flex flex-col h-[560px] rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/40 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-brand-600" />
          <span className="font-bold text-slate-900 dark:text-white">Store Assistant</span>
        </div>
        {messages.length > 0 ? (
          <button
            type="button"
            onClick={onClear}
            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-red-500"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear
          </button>
        ) : null}
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 px-6">
            <Bot className="w-10 h-10 mb-3 text-brand-500/60" />
            <p className="font-semibold text-slate-700 dark:text-slate-300">Ask anything about your store</p>
            <p className="text-sm mt-1">Product ideas, marketing tips, operations help, and more.</p>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div
              key={`${msg.role}-${index}`}
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "ml-auto bg-brand-600 text-white"
                  : "mr-auto bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100"
              }`}
            >
              {msg.content}
            </div>
          ))
        )}
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Loader2 className="w-4 h-4 animate-spin" />
            Thinking...
          </div>
        ) : null}
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t border-slate-100 dark:border-slate-800 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={disabled || loading}
          placeholder={disabled ? "Configure AI in Settings first" : "Type your message..."}
          className="flex-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 outline-none focus:ring-2 focus:ring-brand-500/20 disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={disabled || loading || !input.trim()}
          className="px-4 py-3 rounded-xl bg-brand-600 text-white font-bold disabled:opacity-60"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}

export function AiSetupBanner({ configured }: { configured: boolean }) {
  if (configured) return null;

  return (
    <div className="p-4 rounded-2xl border border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-900/50 text-amber-900 dark:text-amber-100 text-sm">
      AI is not configured yet.{" "}
      <Link href="/admin/settings/ai" className="font-bold underline">
        Set up your provider in Settings → AI Configuration
      </Link>
    </div>
  );
}
