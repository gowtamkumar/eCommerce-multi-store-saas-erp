'use client';

import { PaginationProps } from '@/types/inex';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function Pagination({
  currentPage,
  totalPages,
  baseUrl,
  onPageChange,
  loading = false,
}: PaginationProps) {
  const searchParams = useSearchParams();

  const createPageUrl = (page: number) => {
    if (!baseUrl) return '#';
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    return `${baseUrl}?${params.toString()}`;
  };

  if (totalPages <= 1) return null;

  const PageButton = ({ page, children, className, ariaLabel }: { page: number; children: React.ReactNode; className?: string; ariaLabel?: string }) => {
    const isCurrent = currentPage === page;
    const activeStyles = isCurrent
      ? 'bg-brand-600 text-white shadow-sm shadow-brand-500/25'
      : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400';

    if (onPageChange) {
      return (
        <button
          type="button"
          onClick={() => onPageChange(page)}
          disabled={loading || isCurrent}
          className={`w-10 h-10 flex items-center justify-center rounded-lg text-sm font-medium transition-colors disabled:opacity-75 ${activeStyles} ${className || ''}`}
          aria-label={ariaLabel}
        >
          {children}
        </button>
      );
    }

    return (
      <Link
        href={createPageUrl(page)}
        className={`w-10 h-10 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${activeStyles} ${className || ''}`}
        aria-label={ariaLabel}
      >
        {children}
      </Link>
    );
  };

  const NavButton = ({ page, disabled, children, ariaLabel }: { page: number; disabled: boolean; children: React.ReactNode; ariaLabel: string }) => {
    if (disabled) {
      return (
        <button
          type="button"
          disabled
          className="p-2 rounded-lg border border-slate-100 dark:border-slate-800 text-slate-300 dark:text-slate-600 cursor-not-allowed"
          aria-label={ariaLabel}
        >
          {children}
        </button>
      );
    }

    if (onPageChange) {
      return (
        <button
          type="button"
          onClick={() => onPageChange(page)}
          disabled={loading}
          className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors disabled:opacity-50"
          aria-label={ariaLabel}
        >
          {children}
        </button>
      );
    }

    return (
      <Link
        href={createPageUrl(page)}
        className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors"
        aria-label={ariaLabel}
      >
        {children}
      </Link>
    );
  };

  return (
    <div className="flex items-center justify-center gap-2">
      {/* Previous Button */}
      <NavButton page={currentPage - 1} disabled={currentPage <= 1} ariaLabel="Previous Page">
        <ChevronLeft className="w-5 h-5" />
      </NavButton>

      {/* Page Numbers */}
      <div className="flex items-center gap-1">
        {[...Array(totalPages)].map((_, i) => {
          const page = i + 1;
          // Show first, last, current, and adjacent pages
          if (
            page === 1 ||
            page === totalPages ||
            (page >= currentPage - 1 && page <= currentPage + 1)
          ) {
            return (
              <PageButton key={page} page={page}>
                {page}
              </PageButton>
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
      <NavButton page={currentPage + 1} disabled={currentPage >= totalPages} ariaLabel="Next Page">
        <ChevronRight className="w-5 h-5" />
      </NavButton>
    </div>
  );
}
