"use client";

import { SectionType } from '@/types/page-builder';
import { CheckCircle2, HelpCircle, Layout, Plus, Send, ShoppingCart, Type } from 'lucide-react';

interface SectionLibraryProps {
  onAddSection: (type: SectionType) => void;
}

const sectionTypes = [
  { type: 'hero' as SectionType, label: 'Hero Banner', icon: Layout, color: 'bg-purple-500' },
  { type: 'rich-text' as SectionType, label: 'Rich Text', icon: Type, color: 'bg-blue-500' },
  { type: 'product-grid' as SectionType, label: 'Products', icon: ShoppingCart, color: 'bg-green-500' },
  { type: 'features' as SectionType, label: 'Features', icon: CheckCircle2, color: 'bg-indigo-500' },
  { type: 'faq' as SectionType, label: 'FAQ', icon: HelpCircle, color: 'bg-orange-500' },
  { type: 'cta' as SectionType, label: 'Call to Action', icon: Send, color: 'bg-red-500' },
];

export default function SectionLibrary({ onAddSection }: SectionLibraryProps) {
  return (
    <div className="space-y-2">
      <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-2 mb-3">
        Add Section
      </h3>
      {sectionTypes.map((section) => {
        const Icon = section.icon;
        return (
          <button
            key={section.type}
            onClick={() => onAddSection(section.type)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-left group"
          >
            <div className={`p-2 rounded-lg ${section.color} text-white group-hover:scale-110 transition-transform`}>
              <Icon className="w-4 h-4" />
            </div>
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-brand-600 dark:group-hover:text-brand-400">
              {section.label}
            </span>
            <Plus className="w-4 h-4 ml-auto text-slate-400 group-hover:text-brand-600" />
          </button>
        );
      })}
    </div>
  );
}
