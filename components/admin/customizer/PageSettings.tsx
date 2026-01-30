"use client";

import { PageData } from '@/types/customizer';
import { Globe, Layout, Search, Type } from 'lucide-react';

interface PageSettingsProps {
  data: PageData;
  onUpdate: (data: PageData) => void;
}

export default function PageSettings({ data, onUpdate }: PageSettingsProps) {
  const handleChange = (key: keyof PageData, value: any) => {
    let updated = { ...data, [key]: value };

    // If setting as home page, force slug to /
    if (key === 'isHomePage' && value === true) {
      updated.slug = '/';
    }

    onUpdate(updated);
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
            <label className="text-[10px] font-bold text-slate-500 uppercase">Status</label>
            <select
              value={data.status}
              onChange={(e) => handleChange('status', e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-brand-500 outline-none transition-all appearance-none cursor-pointer"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50">
            <div className="space-y-0.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Home Page</label>
              <p className="text-[10px] text-slate-400">Set this page as your store's home page</p>
            </div>
            <button
              type="button"
              onClick={() => handleChange('isHomePage', !data.isHomePage)}
              className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${data.isHomePage ? 'bg-brand-600' : 'bg-slate-200 dark:bg-slate-700'}`}
            >
              <span
                className={`pointer-events-none block h-3.5 w-3.5 rounded-full bg-white shadow-lg ring-0 transition-transform ${data.isHomePage ? 'translate-x-5' : 'translate-x-1'}`}
              />
            </button>
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

      {/* Typography Settings */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-slate-400 mb-2">
          <Type className="w-3.5 h-3.5" />
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Typography</h3>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase">Body Font</label>
            <select
              value={data.typography?.fontFamily || 'Inter'}
              onChange={(e) => handleChange('typography', { ...data.typography, fontFamily: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-brand-500 outline-none transition-all"
            >
              <option value="Inter">Inter</option>
              <option value="Poppins">Poppins</option>
              <option value="Roboto">Roboto</option>
              <option value="Open Sans">Open Sans</option>
              <option value="Lato">Lato</option>
              <option value="Montserrat">Montserrat</option>
              <option value="Nunito">Nunito</option>
              <option value="Work Sans">Work Sans</option>
              <option value="DM Sans">DM Sans</option>
              <option value="Plus Jakarta Sans">Plus Jakarta Sans</option>
              <option value="Manrope">Manrope</option>
              <option value="Mulish">Mulish</option>
              <option value="Raleway">Raleway</option>
              <option value="Outfit">Outfit</option>
              <option value="Space Grotesk">Space Grotesk</option>
              <option value="Urbanist">Urbanist</option>
              <option value="serif">Serif (System)</option>
              <option value="sans-serif">Sans Serif (System)</option>
              <option value="monospace">Monospace (System)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase">Heading Font</label>
            <select
              value={data.typography?.headingFont || 'Inter'}
              onChange={(e) => handleChange('typography', { ...data.typography, headingFont: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-brand-500 outline-none transition-all"
            >
              <option value="Inter">Inter</option>
              <option value="Poppins">Poppins</option>
              <option value="Montserrat">Montserrat</option>
              <option value="Raleway">Raleway</option>
              <option value="Playfair Display">Playfair Display</option>
              <option value="Bebas Neue">Bebas Neue</option>
              <option value="Oswald">Oswald</option>
              <option value="Anton">Anton</option>
              <option value="Lora">Lora</option>
              <option value="Merriweather">Merriweather</option>
              <option value="Crimson Text">Crimson Text</option>
              <option value="Cinzel">Cinzel</option>
              <option value="Josefin Sans">Josefin Sans</option>
              <option value="Space Grotesk">Space Grotesk</option>
              <option value="Outfit">Outfit</option>
              <option value="DM Sans">DM Sans</option>
              <option value="serif">Serif (System)</option>
              <option value="sans-serif">Sans Serif (System)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase">Base Font Size</label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="12"
                max="24"
                step="1"
                value={data.typography?.baseFontSize || 16}
                onChange={(e) => handleChange('typography', { ...data.typography, baseFontSize: parseInt(e.target.value) })}
                className="flex-1 accent-brand-600"
              />
              <span className="text-[10px] font-bold text-slate-500 w-8 text-right">{data.typography?.baseFontSize || 16}px</span>
            </div>
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
