'use client';

import Link from 'next/link';
import { Plus } from 'lucide-react';

interface PagesEmptyStateProps {
  error: string | null;
  hasPages: boolean;
  onRetry: () => void;
}

export default function PagesEmptyState({ error, hasPages, onRetry }: PagesEmptyStateProps) {
  if (error) {
    return (
      <div className="py-12 text-center">
        <p className="text-red-500 mb-3">{error}</p>
        <button
          type="button"
          onClick={onRetry}
          className="text-sm font-bold text-brand-600 hover:underline"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!hasPages) {
    return (
      <div className="space-y-3 py-12 text-center">
        <p className="text-slate-500">No pages yet.</p>
        <Link
          href="/admin/pages/new"
          className="inline-flex items-center gap-2 text-sm font-bold text-brand-600 hover:underline justify-center"
        >
          <Plus className="w-4 h-4" /> Create your first page
        </Link>
      </div>
    );
  }

  return (
    <div className="py-12 text-center text-slate-400">
      No pages match your filters.
    </div>
  );
}
