"use client";

import { PageData } from '@/types/customizer';
import { ChevronDown, ChevronUp, Globe, Layout, Search, Type } from 'lucide-react';
import { useState } from 'react';

interface PageSettingsProps {
  data: PageData;
  onUpdate: (data: PageData) => void;
}

export default function PageSettings({ data, onUpdate }: PageSettingsProps) {
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleExpand = (id: string) => {
    setExpandedItems(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

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

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase">OG Image URL</label>
            <input
              type="text"
              value={data.ogImage || ''}
              onChange={(e) => handleChange('ogImage', e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-brand-500 outline-none transition-all"
              placeholder="https://example.com/og-image.jpg"
            />
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
          {/* Headings Typography - Collapsible */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-800/30">
            <button
              onClick={() => toggleExpand('typography-headings')}
              className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-slate-100 dark:hover:bg-slate-800/50"
            >
              <h4 className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Headings</h4>
              {expandedItems.includes('typography-headings') ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {expandedItems.includes('typography-headings') && (
              <div className="p-4 border-t border-slate-200 dark:border-slate-700 space-y-4 bg-white dark:bg-slate-900">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Font Family</label>
                  <select
                    value={data.typography?.headingFontFamily || 'Inter'}
                    onChange={(e) => handleChange('typography', { ...data.typography, headingFontFamily: e.target.value })}
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
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Weight</label>
                    <select
                      value={data.typography?.headingFontWeight || '700'}
                      onChange={(e) => handleChange('typography', { ...data.typography, headingFontWeight: e.target.value })}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                    >
                      <option value="400">Regular (400)</option>
                      <option value="500">Medium (500)</option>
                      <option value="600">Semibold (600)</option>
                      <option value="700">Bold (700)</option>
                      <option value="800">Extra Bold (800)</option>
                      <option value="900">Black (900)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Size</label>
                    <input
                      type="text"
                      value={data.typography?.headingFontSize || ''}
                      onChange={(e) => handleChange('typography', { ...data.typography, headingFontSize: e.target.value })}
                      placeholder="2rem"
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Line Height</label>
                  <input
                    type="text"
                    value={data.typography?.headingLineHeight || ''}
                    onChange={(e) => handleChange('typography', { ...data.typography, headingLineHeight: e.target.value })}
                    placeholder="1.2"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Paragraphs Typography - Collapsible */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-800/30">
            <button
              onClick={() => toggleExpand('typography-paragraphs')}
              className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-slate-100 dark:hover:bg-slate-800/50"
            >
              <h4 className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Paragraphs</h4>
              {expandedItems.includes('typography-paragraphs') ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {expandedItems.includes('typography-paragraphs') && (
              <div className="p-4 border-t border-slate-200 dark:border-slate-700 space-y-4 bg-white dark:bg-slate-900">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Font Family</label>
                  <select
                    value={data.typography?.paragraphFontFamily || 'Inter'}
                    onChange={(e) => handleChange('typography', { ...data.typography, paragraphFontFamily: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                  >
                    <option value="Inter">Inter</option>
                    <option value="Roboto">Roboto</option>
                    <option value="Open Sans">Open Sans</option>
                    <option value="Lato">Lato</option>
                    <option value="Poppins">Poppins</option>
                    <option value="Nunito">Nunito</option>
                    <option value="Work Sans">Work Sans</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Weight</label>
                    <select
                      value={data.typography?.paragraphFontWeight || '400'}
                      onChange={(e) => handleChange('typography', { ...data.typography, paragraphFontWeight: e.target.value })}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                    >
                      <option value="300">Light (300)</option>
                      <option value="400">Regular (400)</option>
                      <option value="500">Medium (500)</option>
                      <option value="600">Semibold (600)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Size</label>
                    <input
                      type="text"
                      value={data.typography?.paragraphFontSize || ''}
                      onChange={(e) => handleChange('typography', { ...data.typography, paragraphFontSize: e.target.value })}
                      placeholder="16px"
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Line Height</label>
                  <input
                    type="text"
                    value={data.typography?.paragraphLineHeight || ''}
                    onChange={(e) => handleChange('typography', { ...data.typography, paragraphLineHeight: e.target.value })}
                    placeholder="1.6"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Base Font Size (kept for backwards compatibility) */}
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
