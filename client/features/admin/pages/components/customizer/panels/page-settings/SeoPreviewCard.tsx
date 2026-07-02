import type { PageData } from '@/types/customizer';
import { Globe } from 'lucide-react';
import SectionHeading from './SectionHeading';

interface SeoPreviewCardProps {
  data: PageData;
}

/**
 * Faux SERP card showing how the page will look in Google search results.
 * Falls back to the page title when metaTitle is empty and uses the
 * current window host so the URL preview matches the actual store domain.
 */
export default function SeoPreviewCard({ data }: SeoPreviewCardProps) {
  const host = typeof window !== 'undefined' ? window.location.host : 'yourstore.com';
  const path = data.isHomePage ? '/' : data.slug ? `/${data.slug.replace(/^\/+/, '')}` : '/';

  return (
    <section className="pt-4 border-t border-slate-100 dark:border-slate-800">
      <SectionHeading icon={Globe} label="Search Preview" className="mb-3" />

      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 space-y-1.5">
        <h4 className="text-blue-600 dark:text-blue-400 text-lg font-medium hover:underline cursor-pointer truncate">
          {data.metaTitle || data.title || 'Untitled Page'}
        </h4>
        <p className="text-green-700 dark:text-green-500 text-sm truncate">
          {host}
          {path}
        </p>
        <p className="text-slate-600 dark:text-slate-400 text-xs line-clamp-2">
          {data.metaDescription ||
            'Add a meta description to see how this page will appear in search results.'}
        </p>
      </div>
    </section>
  );
}
