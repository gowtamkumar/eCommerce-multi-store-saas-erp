"use client";

import { Copy, HelpCircle, Loader2, Sparkles } from "lucide-react";
import Link from "next/link";
import { FormEvent, useState } from "react";
import toast from "react-hot-toast";
import type { FaqContentResult } from "../types/ai-studio";

interface FaqContentGeneratorProps {
  loading: boolean;
  disabled: boolean;
  onGenerate: (payload: {
    topic: string;
    category?: string;
    tone?: string;
  }) => Promise<FaqContentResult | null>;
}

export function FaqContentGenerator({
  loading,
  disabled,
  onGenerate,
}: FaqContentGeneratorProps) {
  const [topic, setTopic] = useState("");
  const [category, setCategory] = useState("");
  const [tone, setTone] = useState("professional");
  const [result, setResult] = useState<FaqContentResult | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;
    const data = await onGenerate({
      topic: topic.trim(),
      category: category || undefined,
      tone,
    });
    if (data) setResult(data);
  };

  const copyText = async (text: string) => {
    await navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <form
        onSubmit={handleSubmit}
        className="space-y-4 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/40"
      >
        <div className="flex items-center gap-2 mb-2">
          <HelpCircle className="w-5 h-5 text-brand-600" />
          <h3 className="font-bold text-slate-900 dark:text-white">FAQ generator</h3>
        </div>
        <p className="text-sm text-slate-500 -mt-2">
          Describe a topic or question hint — AI drafts a customer-facing Q&amp;A pair.
        </p>

        <input
          required
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Topic or question hint *"
          disabled={disabled}
          className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 outline-none"
        />
        <input
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="Category (optional, e.g. Shipping)"
          disabled={disabled}
          className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 outline-none"
        />
        <select
          value={tone}
          onChange={(e) => setTone(e.target.value)}
          disabled={disabled}
          className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 outline-none"
        >
          <option value="professional">Professional</option>
          <option value="friendly">Friendly</option>
          <option value="concise">Concise</option>
          <option value="detailed">Detailed</option>
        </select>
        <button
          type="submit"
          disabled={disabled || loading || !topic.trim()}
          className="inline-flex items-center gap-2 px-5 py-3 bg-brand-600 text-white font-bold rounded-xl disabled:opacity-60"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          Generate FAQ
        </button>
      </form>

      <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/30 space-y-4">
        <h3 className="font-bold text-slate-900 dark:text-white">Generated output</h3>
        {!result ? (
          <p className="text-sm text-slate-500">Results will appear here after generation.</p>
        ) : (
          <>
            {[
              { label: "Question", value: result.question },
              { label: "Answer", value: result.answer },
            ].map((field) => (
              <div key={field.label} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    {field.label}
                  </span>
                  <button
                    type="button"
                    onClick={() => copyText(field.value)}
                    className="text-slate-400 hover:text-brand-600"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-sm text-slate-800 dark:text-slate-100 whitespace-pre-wrap">
                  {field.value}
                </p>
              </div>
            ))}
            <p className="text-xs text-slate-500 pt-2">
              Copy into your store, or{" "}
              <Link href="/admin/faqs" className="text-brand-600 font-semibold hover:underline">
                create an FAQ entry
              </Link>{" "}
              in the admin.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
