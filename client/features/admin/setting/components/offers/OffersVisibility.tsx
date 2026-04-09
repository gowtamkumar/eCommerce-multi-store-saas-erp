'use client';

import React, { memo } from 'react';
import { Layout, Image, Tag, ToggleLeft, ToggleRight } from 'lucide-react';

interface OffersVisibilityProps {
  bannerShow: boolean;
  showFilters: boolean;
  onUpdate: (field: string, value: any) => void;
}

export const OffersVisibility = memo(({
  bannerShow,
  showFilters,
  onUpdate
}: OffersVisibilityProps) => {
  const toggles = [
    {
      key: "bannerShow",
      title: "Show Hero Banner",
      description: "Display the promotional hero banner at the top of the offers page.",
      icon: <Image className="w-5 h-5" />,
      value: bannerShow
    },
    {
      key: "showFilters",
      title: "Show Promotion Filters",
      description: "Allow users to filter products by specific promotional offers.",
      icon: <Tag className="w-5 h-5" />,
      value: showFilters
    }
  ];

  return (
    <div className="bg-slate-50 dark:bg-slate-900/50 rounded-3xl p-6 md:p-8 border border-slate-100 dark:border-slate-800">
      <div className="flex items-center gap-3 mb-6">
        <Layout className="w-5 h-5 text-slate-400" />
        <h4 className="text-lg font-bold text-slate-900 dark:text-white">Page Visibility</h4>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {toggles.map((toggle) => {
          const isEnabled = toggle.value;
          return (
            <div
              key={toggle.key}
              className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-4 ${isEnabled ? 'border-brand-500 bg-brand-50/50 text-brand-900 dark:text-white dark:bg-brand-900/10' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 opacity-60 hover:opacity-100'}`}
              onClick={() => onUpdate(toggle.key, !isEnabled)}
            >
              <div className={`p-2 rounded-xl mt-0.5 ${isEnabled ? 'bg-brand-100 dark:bg-brand-800 text-brand-600 dark:text-brand-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                {toggle.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h5 className="font-bold text-sm">{toggle.title}</h5>
                  {isEnabled ? (
                    <ToggleRight className="w-6 h-6 text-brand-500" />
                  ) : (
                    <ToggleLeft className="w-6 h-6 text-slate-400" />
                  )}
                </div>
                <p className={`text-xs ${isEnabled ? 'text-brand-700/70 dark:text-brand-300/70' : 'text-slate-500'}`}>
                  {toggle.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});

OffersVisibility.displayName = 'OffersVisibility';
