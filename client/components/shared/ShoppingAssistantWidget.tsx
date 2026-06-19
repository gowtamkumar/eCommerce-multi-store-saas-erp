"use client";

import { useShoppingAssistant } from "@/features/product/shop/hooks/useShoppingAssistant";
import { useSettings } from "@/hooks/SettingsContext";
import { Loader2, RotateCcw, Send, Sparkles, X } from "lucide-react";
import Link from "next/link";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";

const STARTER_PROMPTS = [
  "What do you sell?",
  "Help me find a gift",
  "What is your return policy?",
];

export default function ShoppingAssistantWidget() {
  const { settings } = useSettings();
  const brandName = settings?.brandName || "our store";
  const tenantId = settings?.tenantId;
  const { available, loading, messages, sendMessage, resetConversation } =
    useShoppingAssistant(tenantId, settings?.brandName);
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [suggestedFollowUps, setSuggestedFollowUps] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const promptSuggestions = useMemo(() => {
    if (suggestedFollowUps.length > 0) {
      return suggestedFollowUps.slice(0, 3);
    }
    return STARTER_PROMPTS;
  }, [suggestedFollowUps]);

  useEffect(() => {
    if (messagesEndRef.current && isOpen) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, loading]);

  if (settings?.isSaaS || !tenantId || available !== true) {
    return null;
  }

  const handleSend = async (value: string) => {
    const result = await sendMessage(value);
    if (result) {
      setInput("");
      setSuggestedFollowUps(result.suggestedFollowUps || []);
    }
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    await handleSend(input);
  };

  return (
    <div className="fixed bottom-20 md:bottom-6 left-6 z-50 flex flex-col items-start">
      {isOpen ? (
        <div className="mb-4 w-80 sm:w-96 h-[420px] sm:h-[500px] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-brand-100 dark:border-brand-900/40 flex flex-col overflow-hidden">
          <div className="bg-brand-600 dark:bg-brand-700 px-4 py-3 flex items-center justify-between text-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-sm leading-none">Shopping assistant</h3>
                <span className="text-[10px] text-brand-100 mt-1 block">
                  Catalog & FAQ help — no checkout
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {messages.length > 0 ? (
                <button
                  type="button"
                  onClick={() => {
                    resetConversation();
                    setSuggestedFollowUps([]);
                  }}
                  className="p-1.5 hover:bg-white/10 rounded-full transition-colors"
                  aria-label="Clear chat"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-white/10 rounded-full transition-colors"
                aria-label="Close assistant"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50 dark:bg-slate-950">
            {messages.length === 0 ? (
              <div className="space-y-4">
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Hi! I can help you browse {brandName}, suggest products, and answer common
                  questions from our FAQ.
                </p>
                <div className="flex flex-wrap gap-2">
                  {promptSuggestions.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      disabled={loading}
                      onClick={() => handleSend(prompt)}
                      className="px-3 py-1.5 rounded-full border border-brand-200 dark:border-brand-800 text-xs font-semibold text-brand-700 dark:text-brand-300 hover:bg-brand-100/60 dark:hover:bg-brand-900/30 disabled:opacity-50"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((message, index) => {
                const isUser = message.role === "user";
                return (
                  <div key={`${message.role}-${index}`} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                        isUser
                          ? "bg-brand-600 text-white rounded-br-none"
                          : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-bl-none border border-slate-100 dark:border-slate-800"
                      }`}
                    >
                      <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                      {!isUser && message.productLinks && message.productLinks.length > 0 ? (
                        <div className="mt-2 space-y-1">
                          {message.productLinks.map((product) => (
                            <Link
                              key={product.slug}
                              href={`/products/${product.slug}`}
                              onClick={() => setIsOpen(false)}
                              className="block text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline"
                            >
                              View {product.name}
                            </Link>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </div>
                );
              })
            )}

            {loading ? (
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Thinking...
              </div>
            ) : null}
            <div ref={messagesEndRef} />
          </div>

          {messages.length > 0 ? (
            <div className="px-4 pt-2 flex flex-wrap gap-2 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
              {promptSuggestions.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  disabled={loading}
                  onClick={() => handleSend(prompt)}
                  className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-[11px] font-semibold text-slate-600 dark:text-slate-300 hover:bg-brand-50 dark:hover:bg-brand-950/40 disabled:opacity-50"
                >
                  {prompt}
                </button>
              ))}
            </div>
          ) : null}

          <form
            onSubmit={onSubmit}
            className="p-3 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask about products or policies..."
              maxLength={500}
              disabled={loading}
              className="flex-1 px-4 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full focus:outline-none focus:ring-2 focus:ring-brand-500 dark:text-white"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white rounded-full transition-colors"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </form>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className="w-14 h-14 bg-brand-600 hover:bg-brand-700 text-white rounded-full flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-all duration-200"
        aria-label="Open shopping assistant"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Sparkles className="w-6 h-6" />}
      </button>
    </div>
  );
}
