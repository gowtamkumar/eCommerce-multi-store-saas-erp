import type { PageData } from '@/types/customizer';
import { Layout, RotateCw } from 'lucide-react';
import { generateSlugFromTitle } from '@/lib/page-url';
import DebouncedInput from '../DebouncedInput';
import SectionHeading from './SectionHeading';

interface PageInfoFieldsProps {
  data: PageData;
  onChange: (key: keyof PageData, value: unknown) => void;
}

const INPUT_CLASS =
  'w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-brand-500 outline-none transition-all';

/**
 * Title, status, home-page toggle, and URL slug. The home-page toggle is a
 * destructive action (it unsets whatever page was previously the home), so
 * the parent confirms before flipping it on — we just emit the change.
 */
export default function PageInfoFields({ data, onChange }: PageInfoFieldsProps) {
  const generatedSlug = generateSlugFromTitle(data.title || '');
  const isOutOfSync = !data.isHomePage && data.slug !== generatedSlug && !!data.title;

  return (
    <section className="space-y-4">
      <SectionHeading icon={Layout} label="Page Information" />

      <div className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-500 uppercase">Page Title</label>
          <DebouncedInput
            type="text"
            value={data.title}
            onChange={(val) => onChange('title', val)}
            className={INPUT_CLASS}
            placeholder="e.g. Home Page"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-500 uppercase">Status</label>
          <select
            value={data.status}
            onChange={(e) => onChange('status', e.target.value)}
            className={`${INPUT_CLASS} appearance-none cursor-pointer`}
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>

        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50">
          <div className="space-y-0.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase">Home Page</label>
            <p className="text-[10px] text-slate-400">Set this page as your store&apos;s home page</p>
          </div>
          <button
            type="button"
            onClick={() => onChange('isHomePage', !data.isHomePage)}
            className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
              data.isHomePage ? 'bg-brand-600' : 'bg-slate-200 dark:bg-slate-700'
            }`}
          >
            <span
              className={`pointer-events-none block h-3.5 w-3.5 rounded-full bg-white shadow-lg ring-0 transition-transform ${
                data.isHomePage ? 'translate-x-5' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-500 uppercase">URL Slug</label>
          <div className="relative">
            <span className="absolute left-3 top-2 text-slate-400 text-sm">/</span>
            <DebouncedInput
              type="text"
              value={data.slug}
              onChange={(val) => onChange('slug', val)}
              disabled={data.isHomePage}
              className={`w-full pl-6 ${isOutOfSync ? 'pr-9' : 'pr-3'} py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-brand-500 outline-none transition-all ${
                data.isHomePage ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              placeholder="page-slug"
            />
            {isOutOfSync && (
              <button
                type="button"
                onClick={() => onChange('slug', generatedSlug)}
                title="Sync with Page Title"
                className="absolute right-2 top-2 p-1 text-slate-400 hover:text-brand-500 transition-colors rounded hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <RotateCw className="w-3.5 h-3.5 animate-in fade-in zoom-in-50 duration-200" />
              </button>
            )}
          </div>
          {data.isHomePage && (
            <p className="text-[9px] text-brand-600 font-bold uppercase tracking-tight">
              Home page slug cannot be changed
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
