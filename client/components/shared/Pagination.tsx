'use client';

import { PaginationProps } from '@/types/inex';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';


export default function Pagination({ currentPage, totalPages, baseUrl }: PaginationProps) {
  const searchParams = useSearchParams();

  const createPageUrl = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    return `${baseUrl}?${params.toString()}`;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      {/* Previous Button */}
      {currentPage > 1 ? (
        <Link
          href={createPageUrl(currentPage - 1)}
          className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          aria-label="Previous Page"
        >
          <ChevronLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
        </Link>
      ) : (
        <button
          disabled
          className="p-2 rounded-lg border border-slate-100 dark:border-slate-800 text-slate-300 dark:text-slate-600 cursor-not-allowed"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      )}

      {/* Page Numbers */}
      <div className="flex items-center gap-1">
        {[...Array(totalPages)].map((_, i) => {
          const page = i + 1;
          // Simple logic: Show first, last, current, and adjacent pages
          if (
            page === 1 ||
            page === totalPages ||
            (page >= currentPage - 1 && page <= currentPage + 1)
          ) {
            return (
              <Link
                key={page}
                href={createPageUrl(page)}
                className={`w-10 h-10 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${currentPage === page
                  ? 'bg-brand-600 text-white shadow-sm shadow-brand-500/25'
                  : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
              >
                {page}
              </Link>
            );
          } else if (
            page === currentPage - 2 ||
            page === currentPage + 2
          ) {
            return (
              <span key={page} className="w-10 h-10 flex items-center justify-center text-slate-400">
                ...
              </span>
            );
          }
          return null;
        })}
      </div>

      {/* Next Button */}
      {currentPage < totalPages ? (
        <Link
          href={createPageUrl(currentPage + 1)}
          className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          aria-label="Next Page"
        >
          <ChevronRight className="w-5 h-5 text-slate-600 dark:text-slate-400" />
        </Link>
      ) : (
        <button
          disabled
          className="p-2 rounded-lg border border-slate-100 dark:border-slate-800 text-slate-300 dark:text-slate-600 cursor-not-allowed"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
