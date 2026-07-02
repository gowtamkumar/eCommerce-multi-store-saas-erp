"use client";

import { useProductQa } from "@/features/product/shop/hooks/useProductQa";
import { useSettings } from "@/hooks/SettingsContext";
import { Loader2, MessageCircleQuestion, RotateCcw, Send, Sparkles } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";

const DEFAULT_PROMPTS = [
  "What are the key features?",
  "Is this in stock?",
  "What options are available?",
];

interface ProductQaWidgetProps {
  productSlug: string;
  productName: string;
}

export default function ProductQaWidget({ productSlug, productName }: ProductQaWidgetProps) {
  const { settings } = useSettings();
  const { available, loading, messages, askQuestion, resetConversation } =
    useProductQa(productSlug, settings?.storeId);
  const [question, setQuestion] = useState("");
  const [suggestedFollowUps, setSuggestedFollowUps] = useState<string[]>([]);

  const promptSuggestions = useMemo(() => {
    if (suggestedFollowUps.length > 0) {
      return suggestedFollowUps.slice(0, 3);
    }
    return DEFAULT_PROMPTS;
  }, [suggestedFollowUps]);

  if (!settings?.storeId || available !== true) {
    return null;
  }

  const handleAsk = async (value: string) => {
    const result = await askQuestion(value);
    if (result) {
      setQuestion("");
      setSuggestedFollowUps(result.suggestedFollowUps || []);
    }
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    await handleAsk(question);
  };

  return (
    <section className="mt-10 rounded-3xl border border-brand-200/70 dark:border-brand-900/40 bg-gradient-to-br from-brand-50/70 via-white to-violet-50/40 dark:from-brand-950/20 dark:via-slate-900 dark:to-violet-950/10 p-6 md:p-8">
      <div className="flex items-start justify-between gap-4 mb-5">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-2xl bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300">
            <MessageCircleQuestion className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                Ask about this product
              </h3>
              <Sparkles className="w-4 h-4 text-brand-600" />
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Answers are based on {productName} details, specs, and FAQs on this page.
            </p>
          </div>
        </div>

        {messages.length > 0 ? (
          <button
            type="button"
            onClick={() => {
              resetConversation();
              setSuggestedFollowUps([]);
            }}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-brand-600 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Clear
          </button>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-2 mb-5">
        {promptSuggestions.map((prompt) => (
          <button
            key={prompt}
            type="button"
            disabled={loading}
            onClick={() => handleAsk(prompt)}
            className="px-3 py-1.5 rounded-full border border-brand-200 dark:border-brand-800 text-xs font-semibold text-brand-700 dark:text-brand-300 hover:bg-brand-100/60 dark:hover:bg-brand-900/30 disabled:opacity-50 transition-colors"
          >
            {prompt}
          </button>
        ))}
      </div>

      {messages.length > 0 ? (
        <div className="space-y-3 mb-5 max-h-72 overflow-y-auto pr-1">
          {messages.map((message, index) => (
            <div
              key={`${message.role}-${index}`}
              className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                message.role === "user"
                  ? "ml-8 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100"
                  : "mr-8 bg-brand-600 text-white"
              }`}
            >
              {message.content}
            </div>
          ))}
        </div>
      ) : null}

      <form onSubmit={onSubmit} className="flex gap-2">
        <input
          type="text"
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder="Ask about materials, sizing, compatibility..."
          maxLength={500}
          disabled={loading}
          className="flex-1 px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none text-sm"
        />
        <button
          type="submit"
          disabled={loading || !question.trim()}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-2xl disabled:opacity-50 transition-colors"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          Ask
        </button>
      </form>

      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-3">
        AI answers use product information only. For orders or returns, contact store support.
      </p>
    </section>
  );
}
