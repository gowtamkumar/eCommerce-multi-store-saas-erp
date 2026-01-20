"use client";

import { PageData } from '@/types/customizer';
import { Globe, Layout, Search } from 'lucide-react';

interface PageSettingsProps {
  data: PageData;
  onUpdate: (data: PageData) => void;
}

export default function PageSettings({ data, onUpdate }: PageSettingsProps) {
  const handleChange = (key: keyof PageData, value: string) => {
    onUpdate({ ...data, [key]: value });
  };

  return (
    <div className="p-6 space-y-8 animate-in fade-in slide-in-from-left-4 duration-300">
      {/* Page Info */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-slate-400 mb-2">
          <Layout className="w-3.5 h-3.5" />
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Page Information</h3>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase">Page Title</label>
            <input
              type="text"
              value={data.title}
              onChange={(e) => handleChange('title', e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-brand-500 outline-none transition-all"
              placeholder="e.g. Home Page"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase">URL Slug</label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-slate-400 text-sm">/</span>
              <input
                type="text"
                value={data.slug}
                onChange={(e) => handleChange('slug', e.target.value)}
                disabled={data.isHomePage}
                className={`w-full pl-6 pr-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-brand-500 outline-none transition-all ${data.isHomePage ? 'opacity-50 cursor-not-allowed' : ''}`}
                placeholder="page-slug"
              />
            </div>
            {data.isHomePage && (
              <p className="text-[9px] text-brand-600 font-bold uppercase tracking-tight">Home page slug cannot be changed</p>
            )}
          </div>
        </div>
      </section>

      {/* SEO Settings */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-slate-400 mb-2">
          <Search className="w-3.5 h-3.5" />
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Search Engine Optimization</h3>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase">Meta Title</label>
            <input
              type="text"
              value={data.metaTitle || ''}
              onChange={(e) => handleChange('metaTitle', e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-brand-500 outline-none transition-all"
              placeholder="Google search title"
            />
            <p className="text-[9px] text-slate-400">Optimal: 50-60 characters. Current: {data.metaTitle?.length || 0}</p>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase">Meta Description</label>
            <textarea
              value={data.metaDescription || ''}
              onChange={(e) => handleChange('metaDescription', e.target.value)}
              rows={4}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-brand-500 outline-none transition-all"
              placeholder="What this page is about..."
            />
            <p className="text-[9px] text-slate-400">Optimal: 150-160 characters. Current: {data.metaDescription?.length || 0}</p>
          </div>
        </div>
      </section>

      {/* SEO Preview */}
      <section className="pt-4 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2 text-slate-400 mb-3">
          <Globe className="w-3.5 h-3.5" />
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Search Preview</h3>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 space-y-1.5">
          <h4 className="text-blue-600 dark:text-blue-400 text-lg font-medium hover:underline cursor-pointer truncate">
            {data.metaTitle || data.title || 'Untitled Page'}
          </h4>
          <p className="text-green-700 dark:text-green-500 text-sm truncate">
            yourstore.com/{data.slug === '/' ? '' : data.slug}
          </p>
          <p className="text-slate-600 dark:text-slate-400 text-xs line-clamp-2">
            {data.metaDescription || 'Add a meta description to see how this page will appear in search results.'}
          </p>
        </div>
      </section>
    </div>
  );
}
