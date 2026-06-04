'use client';

import Link from 'next/link';
import { Eye, Home, Pencil, Trash2 } from 'lucide-react';
import { DataTableColumn } from '@/components/shared/DataTable';
import { getPagePublicPath } from '@/lib/page-url';
import { Page } from '../../type';

interface BuildPageColumnsArgs {
  updatingOrder: string | null;
  onOrderInput: (id: string, raw: string) => void;
  onOrderBlur: (id: string) => void;
  onDelete: (page: Page) => void;
}

export function buildPageColumns({
  updatingOrder,
  onOrderInput,
  onOrderBlur,
  onDelete,
}: BuildPageColumnsArgs): DataTableColumn<Page>[] {
  return [
    {
      key: 'title',
      header: 'Title',
      className: 'px-6 py-4',
      cell: (page) => (
        <div className="flex items-center gap-3">
          <span className="font-semibold text-slate-900 dark:text-white">
            {page.title}
          </span>
          {page.isHomePage && (
            <span className="flex items-center gap-1 px-2 py-0.5 bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 text-[10px] font-bold rounded-full uppercase tracking-wider">
              <Home className="w-3 h-3" /> Home
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'slug',
      header: 'URL Slug',
      className: 'px-6 py-4',
      cell: (page) => (
        <code className="text-xs bg-slate-100 dark:bg-slate-900 px-2 py-1 rounded text-slate-600 dark:text-slate-400">
          {getPagePublicPath(page)}
        </code>
      ),
    },
    {
      key: 'order',
      header: 'Order',
      className: 'px-6 py-4',
      cell: (page) => (
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={page.order ?? 0}
            onChange={(e) => onOrderInput(page.id, e.target.value)}
            onBlur={() => onOrderBlur(page.id)}
            className="w-16 px-2 py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-brand-500 outline-none transition-all"
          />
          {updatingOrder === page.id && (
            <span className="text-xs text-brand-600 animate-pulse font-semibold">Saving...</span>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      className: 'px-6 py-4',
      cell: (page) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
            page.status === 'published'
              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
              : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
          }`}
        >
          {page.status}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      headerClassName: 'text-right',
      className: 'px-6 py-4 text-right',
      cell: (page) => (
        <div className="flex justify-end gap-2">
          <Link
            href={getPagePublicPath(page)}
            target="_blank"
            className="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/20 rounded-xl transition-all"
            title="View Live"
          >
            <Eye className="w-5 h-5" />
          </Link>
          <Link
            href={`/admin/pages/${page.id}`}
            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all"
            title="Edit Design"
          >
            <Pencil className="w-5 h-5" />
          </Link>
          <button
            onClick={() => onDelete(page)}
            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
            title="Delete"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      ),
    },
  ];
}
