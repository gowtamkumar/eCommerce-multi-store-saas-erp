"use client";

import { PAGE_TEMPLATES, PageTemplate } from '@/features/admin/pages/lib/page-templates';
import { CustomizerSection } from '@/types/customizer';
import { CheckCircle2, FileText, LayoutGrid, ShoppingBag, Sparkles, X } from 'lucide-react';
import React from 'react';

const ICONS: Record<PageTemplate['category'], React.ElementType> = {
  Blank: FileText,
  Landing: Sparkles,
  Storefront: ShoppingBag,
  Marketing: LayoutGrid,
};

export interface TemplatePickerProps {
  onSelect: (sections: CustomizerSection[]) => void;
  onClose: () => void;
}

export default function TemplatePicker({ onSelect, onClose }: TemplatePickerProps) {
  return (
    <div
      className="fixed inset-0 z-200 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Start with a template</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Pick a starter to skip the blank page.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {PAGE_TEMPLATES.map((tpl) => {
              const Icon = ICONS[tpl.category];
              return (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => onSelect(tpl.build())}
                  className="text-left group rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden hover:border-brand-500 hover:shadow-lg transition-all"
                >
                  <div className="aspect-video bg-gradient-to-br from-brand-50 to-brand-100 dark:from-brand-900/30 dark:to-brand-800/20 flex items-center justify-center">
                    <Icon className="w-12 h-12 text-brand-500" />
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        {tpl.name}
                      </h4>
                      <span className="text-[9px] font-bold uppercase tracking-wider text-brand-600">
                        {tpl.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                      {tpl.description}
                    </p>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity mt-3 flex items-center gap-1.5 text-xs font-bold text-brand-600">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Use this template
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
