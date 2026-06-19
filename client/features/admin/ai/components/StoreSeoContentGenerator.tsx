"use client";

import { Copy, Loader2, Sparkles, Store } from "lucide-react";
import Link from "next/link";
import { FormEvent, useState } from "react";
import toast from "react-hot-toast";
import type { StoreSeoResult } from "../types/ai-studio";

interface StoreSeoContentGeneratorProps {
  loading: boolean;
  disabled: boolean;
  onGenerate: (payload: {
    brandName: string;
    keywords?: string;
    existingDescription?: string;
    tone?: string;
  }) => Promise<StoreSeoResult | null>;
}

export function StoreSeoContentGenerator({
  loading,
  disabled,
  onGenerate,
}: StoreSeoContentGeneratorProps) {
  const [brandName, setBrandName] = useState("");
  const [keywords, setKeywords] = useState("");
  const [existingDescription, setExistingDescription] = useState("");
  const [tone, setTone] = useState("professional");
  const [result, setResult] = useState<StoreSeoResult | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!brandName.trim()) return;
    const data = await onGenerate({
      brandName: brandName.trim(),
      keywords: keywords || undefined,
      existingDescription: existingDescription || undefined,
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
          <Store className="w-5 h-5 text-brand-600" />
          <h3 className="font-bold text-slate-900 dark:text-white">Store SEO</h3>
        </div>
        <p className="text-sm text-slate-500 -mt-2">
          Generate default meta title and description for your storefront — used when page-level SEO is empty.
        </p>

        <input
          required
          value={brandName}
          onChange={(e) => setBrandName(e.target.value)}
          placeholder="Brand / store name *"
          disabled={disabled}
          className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 outline-none"
        />
        <input
          value={keywords}
          onChange={(e) => setKeywords(e.target.value)}
          placeholder="Keywords (optional)"
          disabled={disabled}
          className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 outline-none"
        />
        <textarea
          value={existingDescription}
          onChange={(e) => setExistingDescription(e.target.value)}
          placeholder="Existing site description to improve (optional)"
          rows={3}
          disabled={disabled}
          className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 outline-none resize-none"
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
          <option value="persuasive">Persuasive</option>
        </select>
        <button
          type="submit"
          disabled={disabled || loading || !brandName.trim()}
          className="inline-flex items-center gap-2 px-5 py-3 bg-brand-600 text-white font-bold rounded-xl disabled:opacity-60"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          Generate store SEO
        </button>
      </form>

      <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/30 space-y-4">
        <h3 className="font-bold text-slate-900 dark:text-white">Generated output</h3>
        {!result ? (
          <p className="text-sm text-slate-500">Results will appear here after generation.</p>
        ) : (
          <>
            {[
              { label: "Meta title", value: result.metaTitle },
              { label: "Meta description", value: result.metaDescription },
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
              Copy into settings, or open{" "}
              <Link
                href="/admin/settings/marketing"
                className="text-brand-600 font-semibold hover:underline"
              >
                Marketing settings
              </Link>{" "}
              to apply store-wide SEO defaults.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
