"use client";

import Link from "next/link";
import { Bot, Loader2, Send, Square, Trash2 } from "lucide-react";
import { FormEvent, useEffect, useRef, useState } from "react";

interface AiChatPanelProps {
  messages: Array<{ role: "user" | "assistant"; content: string }>;
  loading: boolean;
  disabled: boolean;
  streamingContent?: string;
  onSend: (message: string) => Promise<void>;
  onSendStream?: (message: string) => Promise<void>;
  onCancelStream?: () => void;
  onClear: () => void;
}

export function AiChatPanel({
  messages,
  loading,
  disabled,
  streamingContent,
  onSend,
  onSendStream,
  onCancelStream,
  onClear,
}: AiChatPanelProps) {
  const [input, setInput] = useState("");
  const [useStream, setUseStream] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading || disabled) return;
    const value = input;
    setInput("");
    if (useStream && onSendStream) {
      await onSendStream(value);
    } else {
      await onSend(value);
    }
  };

  const showStreamingIndicator = loading && streamingContent !== undefined;
  const hasStreamingContent = streamingContent !== undefined && streamingContent.length > 0;

  return (
    <div className="flex flex-col h-[560px] rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/40 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-brand-600" />
          <span className="font-bold text-slate-900 dark:text-white">Store Assistant</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setUseStream(!useStream)}
            className={`text-xs font-semibold px-2 py-1 rounded-lg transition-colors ${
              useStream
                ? "bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300"
                : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
            }`}
            title={useStream ? "Streaming enabled" : "Streaming disabled"}
          >
            Stream
          </button>
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
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {messages.length === 0 && !hasStreamingContent ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 px-6">
            <Bot className="w-10 h-10 mb-3 text-brand-500/60" />
            <p className="font-semibold text-slate-700 dark:text-slate-300">Ask anything about your store</p>
            <p className="text-sm mt-1">Product ideas, marketing tips, operations help, and more.</p>
          </div>
        ) : (
          <>
            {messages.map((msg, index) => (
              <div
                key={`${msg.role}-${index}`}
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === "user"
                    ? "ml-auto bg-brand-600 text-white"
                    : "mr-auto bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100"
                }`}
              >
                {msg.content}
              </div>
            ))}
            {hasStreamingContent ? (
              <div className="max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap mr-auto bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100">
                {streamingContent}
                <span className="inline-block w-2 h-4 ml-0.5 bg-brand-600 animate-pulse rounded-sm" />
              </div>
            ) : null}
          </>
        )}
        {loading && !hasStreamingContent ? (
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Loader2 className="w-4 h-4 animate-spin" />
            Thinking...
          </div>
        ) : null}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t border-slate-100 dark:border-slate-800 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={disabled || loading}
          placeholder={disabled ? "Configure AI in Settings first" : "Type your message..."}
          className="flex-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 outline-none focus:ring-2 focus:ring-brand-500/20 disabled:opacity-60"
        />
        {showStreamingIndicator && onCancelStream ? (
          <button
            type="button"
            onClick={onCancelStream}
            className="px-4 py-3 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 transition-colors"
            title="Stop generating"
          >
            <Square className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="submit"
            disabled={disabled || loading || !input.trim()}
            className="px-4 py-3 rounded-xl bg-brand-600 text-white font-bold disabled:opacity-60"
          >
            <Send className="w-4 h-4" />
          </button>
        )}
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
