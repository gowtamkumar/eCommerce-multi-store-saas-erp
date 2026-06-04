'use client';

import Link from 'next/link';
import { Plus } from 'lucide-react';

export default function PagesHeader() {
  return (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white font-display">
          Pages
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Manage your store&apos;s dynamic pages and homepage design.
        </p>
      </div>
      <Link
        href="/admin/pages/new"
        className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg flex items-center justify-center gap-2 transition-colors font-bold shadow-lg shadow-brand-500/20 shrink-0"
      >
        <Plus className="w-5 h-5" /> New Page
      </Link>
    </div>
  );
}
