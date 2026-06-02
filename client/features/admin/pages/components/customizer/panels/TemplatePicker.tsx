"use client";

import { PAGE_TEMPLATES, PageTemplate } from '@/features/admin/pages/lib/page-templates';
import { CustomizerSection } from '@/types/customizer';
import {
  CheckCircle2,
  FileText,
  LayoutGrid,
  ShoppingBag,
  Sparkles,
  X,
  Compass,
  Search,
  ArrowRight,
  Layers,
} from 'lucide-react';
import React, { useState, useMemo } from 'react';

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  All: Compass,
  Blank: FileText,
  Landing: Sparkles,
  Storefront: ShoppingBag,
  Marketing: LayoutGrid,
};

const CATEGORIES = [
  { id: 'All', label: 'All Templates' },
  { id: 'Blank', label: 'Blank Canvas' },
  { id: 'Landing', label: 'Landing Pages' },
  { id: 'Storefront', label: 'Storefronts' },
  { id: 'Marketing', label: 'Marketing & Promo' },
];

export interface TemplatePickerProps {
  onSelect: (sections: CustomizerSection[]) => void;
  onClose: () => void;
}

/**
 * Custom micro-schematic renderer to draw visual layout components for each template.
 * Renders stylized mini visual block shapes representing the actual component sequence.
 */
function TemplateSchematic({ sections }: { sections: CustomizerSection[] }) {
  if (sections.length === 0) {
    return (
      <div className="w-full h-full bg-slate-50 dark:bg-slate-900/40 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center p-4 min-h-[140px]">
        <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 mb-2">
          <FileText className="w-4.5 h-4.5" />
        </div>
        <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Empty Canvas</span>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl border border-slate-100 dark:border-slate-850 flex flex-col gap-1.5 overflow-hidden justify-center min-h-[140px]">
      {sections.map((s, index) => {
        switch (s.type) {
          case 'banner':
            return (
              <div key={index} className="h-9 rounded-lg bg-slate-200 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700/50 flex flex-col items-center justify-center gap-0.5 shrink-0 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-brand-500/10 to-transparent" />
                <div className="w-14 h-1 bg-slate-400 dark:bg-slate-650 rounded-full" />
                <div className="w-7 h-0.5 bg-slate-300 dark:bg-slate-700 rounded-full" />
                <div className="flex gap-0.5 mt-0.5">
                  <div className="w-4 h-1 rounded-sm bg-brand-500" />
                  <div className="w-4 h-1 rounded-sm bg-slate-300 dark:bg-slate-700" />
                </div>
              </div>
            );
          case 'stats-counter':
            return (
              <div key={index} className="h-6 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/60 flex items-center justify-around px-2 shrink-0">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex flex-col items-center gap-0.5">
                    <div className="w-2.5 h-1 bg-brand-500 rounded-full" />
                    <div className="w-3 h-0.5 bg-slate-300 dark:bg-slate-700 rounded-full" />
                  </div>
                ))}
              </div>
            );
          case 'newsletter':
            return (
              <div key={index} className="h-6 rounded-lg bg-brand-50/50 dark:bg-brand-950/20 border border-brand-100/10 flex items-center justify-between px-2 shrink-0">
                <div className="w-10 h-1 bg-slate-400 dark:bg-slate-650 rounded-full" />
                <div className="flex gap-0.5 items-center">
                  <div className="w-8 h-2 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850" />
                  <div className="w-4 h-2 rounded bg-brand-500" />
                </div>
              </div>
            );
          case 'category-grid':
            return (
              <div key={index} className="h-7 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/60 flex items-center justify-center gap-1 shrink-0">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-3.5 h-3.5 rounded bg-slate-100 dark:bg-slate-800" />
                ))}
              </div>
            );
          case 'product-slider':
            return (
              <div key={index} className="h-9 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/60 flex items-center gap-1.5 px-2 shrink-0 overflow-hidden">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="w-7 h-7 rounded bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-900 flex flex-col justify-end p-0.5 gap-0.5 shrink-0">
                    <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded" />
                    <div className="w-5 h-0.5 bg-slate-400 dark:bg-slate-600 rounded" />
                    <div className="w-3 h-0.5 bg-slate-300 dark:bg-slate-700 rounded" />
                  </div>
                ))}
              </div>
            );
          case 'brand-grid':
            return (
              <div key={index} className="h-6 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/60 flex items-center justify-around px-2 shrink-0">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-5 h-1.5 rounded bg-slate-100 dark:bg-slate-800" />
                ))}
              </div>
            );
          case 'review-slider':
            return (
              <div key={index} className="h-7 rounded-lg bg-brand-50/20 dark:bg-brand-950/10 border border-brand-100/10 flex flex-col items-center justify-center gap-0.5 shrink-0">
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="w-0.5 h-0.5 bg-yellow-400 rounded-full" />
                  ))}
                </div>
                <div className="w-12 h-0.5 bg-slate-400 dark:bg-slate-650 rounded-full" />
                <div className="w-6 h-0.5 bg-slate-350 dark:bg-slate-700 rounded-full" />
              </div>
            );
          case 'offer-banner':
            return (
              <div key={index} className="h-6 rounded-lg bg-brand-500 flex items-center justify-between px-2 shrink-0 relative overflow-hidden">
                <div className="w-14 h-1 bg-white rounded-full opacity-90" />
                <div className="w-5 h-2 rounded bg-white shrink-0" />
              </div>
            );
          case 'faq-section':
            return (
              <div key={index} className="h-8 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/60 flex flex-col justify-center gap-0.5 px-2 shrink-0">
                <div className="flex justify-between items-center">
                  <div className="w-10 h-0.5 bg-slate-400 dark:bg-slate-650 rounded-full" />
                  <div className="w-1 h-1 bg-slate-350 rounded-full" />
                </div>
                <div className="flex justify-between items-center">
                  <div className="w-12 h-0.5 bg-slate-400 dark:bg-slate-650 rounded-full" />
                  <div className="w-1 h-1 bg-slate-350 rounded-full" />
                </div>
              </div>
            );
          case 'contact':
            return (
              <div key={index} className="h-8 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/60 flex items-center justify-between px-2 shrink-0">
                <div className="flex flex-col gap-0.5">
                  <div className="w-7 h-1 bg-slate-400 dark:bg-slate-650 rounded-full" />
                  <div className="w-4 h-0.5 bg-slate-300 dark:bg-slate-700 rounded-full" />
                </div>
                <div className="w-6 h-2 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-850 shrink-0" />
              </div>
            );
          case 'video-block':
            return (
              <div key={index} className="h-9 rounded-lg bg-slate-950 flex items-center justify-center shrink-0 relative overflow-hidden">
                <div className="absolute inset-0 bg-brand-500/10" />
                <div className="w-3.5 h-3.5 rounded-full bg-white/20 flex items-center justify-center">
                  <div className="w-0 h-0 border-y-[1.5px] border-y-transparent border-l-[3px] border-l-white ml-0.5" />
                </div>
              </div>
            );
          default:
            return (
              <div key={index} className="h-4 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-800/40 shrink-0" />
            );
        }
      })}
    </div>
  );
}

export default function TemplatePicker({ onSelect, onClose }: TemplatePickerProps) {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter templates dynamically
  const filteredTemplates = useMemo(() => {
    return PAGE_TEMPLATES.filter((tpl) => {
      // Category filter
      if (activeCategory !== 'All' && tpl.category !== activeCategory) {
        return false;
      }
      // Search filter
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        return (
          tpl.name.toLowerCase().includes(query) ||
          tpl.description.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [activeCategory, searchQuery]);

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/60 backdrop-blur-md p-4 md:p-6 animate-in fade-in duration-250"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-5xl h-[85vh] md:h-[80vh] flex flex-col md:flex-row shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800/80 transform transition-all scale-100 opacity-100 animate-in zoom-in-95 duration-250"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left Pane: Category Sidebar */}
        <aside className="w-full md:w-64 bg-slate-50 dark:bg-slate-900/60 p-5 border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-800 flex flex-col shrink-0">
          <div className="flex items-center gap-2.5 mb-6">
            <div className="w-9 h-9 rounded-xl bg-brand-500 flex items-center justify-center text-white shadow-lg shadow-brand-500/20">
              <Layers className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">Page Starter</h3>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold">Theme & Layout Center</p>
            </div>
          </div>

          <div className="flex md:flex-col gap-1.5 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0 scrollbar-none shrink-0">
            {CATEGORIES.map((cat) => {
              const Icon = CATEGORY_ICONS[cat.id] || Compass;
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setActiveCategory(cat.id);
                  }}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap md:w-full border cursor-pointer ${
                    isActive
                      ? 'bg-brand-500 text-white border-brand-500 shadow-md shadow-brand-500/10'
                      : 'bg-white dark:bg-slate-800/40 border-slate-200/60 dark:border-slate-800/60 text-slate-650 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <Icon className={`w-4.5 h-4.5 ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500'}`} />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          <div className="hidden md:flex flex-col gap-2.5 mt-auto p-4 bg-brand-50/50 dark:bg-brand-950/10 border border-brand-100/20 rounded-2xl">
            <h4 className="text-[10px] font-black text-brand-650 dark:text-brand-400 uppercase tracking-widest">Quick Tip</h4>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
              Choosing a template replaces the draft canvas, creating preloaded, high-converting blocks you can easily edit or customize.
            </p>
          </div>
        </aside>

        {/* Right Pane: Catalog Search and Grid */}
        <main className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-slate-900">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 border-b border-slate-105 dark:border-slate-800">
            <div>
              <h2 className="text-base font-black text-slate-850 dark:text-white">Choose a starting layout</h2>
              <p className="text-[11px] text-slate-450 dark:text-slate-500 font-bold mt-0.5">
                {filteredTemplates.length} beautiful templates matching active filters
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              {/* Search Box */}
              <div className="relative w-full sm:w-56">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 dark:text-slate-500" />
                <input
                  type="text"
                  placeholder="Search layouts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:bg-white dark:focus:bg-slate-900 focus:border-brand-500 outline-none transition-all placeholder:text-slate-400 text-slate-700 dark:text-slate-350"
                />
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-rose-500 dark:hover:text-rose-450 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-xl transition-all cursor-pointer border border-transparent hover:border-rose-100 dark:hover:border-rose-900/30"
                aria-label="Close"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>
          </div>

          {/* Grid Catalog */}
          <div className="flex-1 overflow-y-auto p-6 no-scrollbar bg-slate-50/30 dark:bg-slate-950/20">
            {filteredTemplates.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
                <Layers className="w-10 h-10 text-slate-350 dark:text-slate-700 mb-3 animate-bounce duration-1000" />
                <h3 className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest">No layouts found</h3>
                <p className="text-[10px] text-slate-450 dark:text-slate-500 mt-1 max-w-[240px]">
                  Try refining your search keyword or selecting a different category sidebar tab.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTemplates.map((tpl) => {
                  const Icon = CATEGORY_ICONS[tpl.category] || FileText;
                  const sectionsCount = tpl.build().length;

                  return (
                    <div
                      key={tpl.id}
                      className="group flex flex-col bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800/80 shadow-sm hover:border-brand-500 dark:hover:border-brand-500 hover:shadow-xl hover:shadow-brand-500/5 hover:-translate-y-0.5 transition-all duration-300 overflow-hidden flex-col"
                    >
                      {/* Interactive Visual Schematic Mockup */}
                      <div className="p-3.5 bg-slate-50/50 dark:bg-slate-950/40 border-b border-slate-100 dark:border-slate-800 flex-1 min-h-[160px] flex items-center justify-center">
                        <TemplateSchematic sections={tpl.build()} />
                      </div>

                      {/* Details */}
                      <div className="p-4 flex flex-col gap-2 bg-white dark:bg-slate-900 border-t border-slate-100/50 dark:border-slate-800/30">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-brand-50 dark:bg-brand-950/30 text-brand-600 dark:text-brand-400">
                            {tpl.category}
                          </span>
                          <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 flex items-center gap-1">
                            <Layers className="w-2.5 h-2.5" />
                            {sectionsCount} {sectionsCount === 1 ? 'section' : 'sections'}
                          </span>
                        </div>

                        <div>
                          <h4 className="text-xs font-black text-slate-850 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                            {tpl.name}
                          </h4>
                          <p className="text-[10px] text-slate-450 dark:text-slate-500 leading-normal font-semibold mt-1 line-clamp-2">
                            {tpl.description}
                          </p>
                        </div>

                        {/* Interactive Click Handler Trigger Button */}
                        <button
                          type="button"
                          onClick={() => onSelect(tpl.build())}
                          className="w-full mt-2 py-2 px-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800/80 group-hover:bg-brand-500 group-hover:border-brand-500 group-hover:text-white text-slate-700 dark:text-slate-350 text-[10px] font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm group-hover:shadow-lg group-hover:shadow-brand-500/10 active:scale-[0.97]"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0 group-hover:text-white text-brand-500 transition-colors" />
                          <span>Use Layout</span>
                          <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all shrink-0" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
