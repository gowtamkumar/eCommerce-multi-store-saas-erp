"use client";

import { Copy, Loader2, Package, Sparkles } from "lucide-react";
import { FormEvent, useState } from "react";
import toast from "react-hot-toast";
import type { ProductContentResult } from "../types/ai-studio";

interface ProductContentGeneratorProps {
  loading: boolean;
  disabled: boolean;
  onGenerate: (payload: {
    productName: string;
    category?: string;
    keywords?: string;
    existingDescription?: string;
    tone?: string;
  }) => Promise<ProductContentResult | null>;
}

export function ProductContentGenerator({
  loading,
  disabled,
  onGenerate,
}: ProductContentGeneratorProps) {
  const [productName, setProductName] = useState("");
  const [category, setCategory] = useState("");
  const [keywords, setKeywords] = useState("");
  const [tone, setTone] = useState("professional");
  const [existingDescription, setExistingDescription] = useState("");
  const [result, setResult] = useState<ProductContentResult | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!productName.trim()) return;
    const data = await onGenerate({
      productName: productName.trim(),
      category: category || undefined,
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
      <form onSubmit={handleSubmit} className="space-y-4 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/40">
        <div className="flex items-center gap-2 mb-2">
          <Package className="w-5 h-5 text-brand-600" />
          <h3 className="font-bold text-slate-900 dark:text-white">Product content</h3>
        </div>

        <input
          required
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
          placeholder="Product name *"
          disabled={disabled}
          className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 outline-none"
        />
        <input
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="Category (optional)"
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
        <select
          value={tone}
          onChange={(e) => setTone(e.target.value)}
          disabled={disabled}
          className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 outline-none"
        >
          <option value="professional">Professional</option>
          <option value="friendly">Friendly</option>
          <option value="luxury">Luxury</option>
          <option value="playful">Playful</option>
        </select>
        <textarea
          value={existingDescription}
          onChange={(e) => setExistingDescription(e.target.value)}
          placeholder="Existing description to improve (optional)"
          rows={4}
          disabled={disabled}
          className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 outline-none resize-none"
        />
        <button
          type="submit"
          disabled={disabled || loading || !productName.trim()}
          className="inline-flex items-center gap-2 px-5 py-3 bg-brand-600 text-white font-bold rounded-xl disabled:opacity-60"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          Generate content
        </button>
      </form>

      <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/30 space-y-4">
        <h3 className="font-bold text-slate-900 dark:text-white">Generated output</h3>
        {!result ? (
          <p className="text-sm text-slate-500">Results will appear here after generation.</p>
        ) : (
          <>
            {[
              { label: "Title", value: result.title },
              { label: "Short description", value: result.shortDescription },
              { label: "Description", value: result.description },
              { label: "SEO title", value: result.seoTitle },
              { label: "SEO description", value: result.seoDescription },
              { label: "Tags", value: result.tags?.join(", ") || "" },
            ].map((field) => (
              <div key={field.label} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wide text-slate-500">{field.label}</span>
                  <button
                    type="button"
                    onClick={() => copyText(field.value)}
                    className="text-slate-400 hover:text-brand-600"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-sm text-slate-800 dark:text-slate-100 whitespace-pre-wrap">{field.value}</p>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
