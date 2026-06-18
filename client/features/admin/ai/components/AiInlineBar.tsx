"use client";

import { Loader2, Sparkles } from "lucide-react";
import Link from "next/link";

interface AiInlineBarProps {
  title: string;
  hint: string;
  configured: boolean | null;
  loading: boolean;
  disabled?: boolean;
  onGenerate: () => void;
  children?: React.ReactNode;
}

export function AiInlineBar({
  title,
  hint,
  configured,
  loading,
  disabled,
  onGenerate,
  children,
}: AiInlineBarProps) {
  if (configured === null) return null;

  return (
    <div className="rounded-2xl border border-brand-200/60 dark:border-brand-900/40 bg-gradient-to-r from-brand-50/80 to-violet-50/50 dark:from-brand-950/30 dark:to-violet-950/20 p-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <Sparkles className="w-4 h-4 text-brand-600 shrink-0" />
          <div>
            <p className="font-bold text-slate-900 dark:text-white text-sm">{title}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{hint}</p>
          </div>
        </div>

        {configured ? (
          <div className="flex flex-1 flex-wrap items-center gap-2 sm:justify-end">
            {children}
            <button
              type="button"
              onClick={onGenerate}
              disabled={loading || disabled}
              className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-bold rounded-xl disabled:opacity-50 whitespace-nowrap"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              Generate
            </button>
          </div>
        ) : (
          <p className="text-sm text-amber-800 dark:text-amber-200 sm:ml-auto">
            <Link href="/admin/settings/ai" className="font-bold underline">
              Configure AI
            </Link>{" "}
            to enable generation
          </p>
        )}
      </div>
    </div>
  );
}
