"use client";

import { CustomizerSection, SectionType } from '@/types/customizer';
import { Grid, GripVertical, ImageIcon, Layout, Mail, Plus, Sliders, Trash2, Type } from 'lucide-react';

interface SidebarProps {
  sections: CustomizerSection[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onUpdate: (sections: CustomizerSection[]) => void;
}

const SECTION_ICONS: Record<SectionType, any> = {
  'hero-banner': Layout,
  'featured-collection': Grid,
  'product-slider': Sliders,
  'rich-text': Type,
  'image-with-text': ImageIcon,
  'newsletter': Mail,
};

export default function Sidebar({ sections, selectedId, onSelect, onUpdate }: SidebarProps) {
  const addSection = (type: SectionType) => {
    const newSection: CustomizerSection = {
      id: `section-${Date.now()}`,
      type,
      settings: {},
      styles: { paddingTop: 40, paddingBottom: 40 },
    };
    onUpdate([...sections, newSection]);
    onSelect(newSection.id);
  };

  const deleteSection = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onUpdate(sections.filter(s => s.id !== id));
    if (selectedId === id) onSelect(null);
  };

  const getLabel = (type: SectionType) => {
    return type.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  return (
    <div className="p-4 flex flex-col h-full overflow-hidden">
      <div className="flex-1 overflow-y-auto space-y-2 mb-4">
        {sections.map((section) => {
          const Icon = SECTION_ICONS[section.type] || Layout;
          const isActive = selectedId === section.id;

          return (
            <div
              key={section.id}
              onClick={() => onSelect(section.id)}
              className={`group flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${isActive ? 'bg-brand-50 border-brand-200 dark:bg-brand-900/20 dark:border-brand-800' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-brand-200 dark:hover:border-brand-800'}`}
            >
              <div className="text-slate-400 group-hover:text-slate-600 transition-colors">
                <GripVertical className="w-4 h-4 cursor-grab" />
              </div>
              <div className={`p-2 rounded-lg ${isActive ? 'bg-brand-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-bold truncate ${isActive ? 'text-brand-900 dark:text-brand-100' : 'text-slate-700 dark:text-slate-300'}`}>
                  {getLabel(section.type)}
                </p>
              </div>
              <button
                onClick={(e) => deleteSection(section.id, e)}
                className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}

        {sections.length === 0 && (
          <div className="text-center py-10 px-4">
            <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400">
              <Plus className="w-6 h-6" />
            </div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">No sections added</p>
            <p className="text-[10px] text-slate-400 mt-1">Start by adding a section from the buttons below</p>
          </div>
        )}
      </div>

      <div className="shrink-0 border-t border-slate-200 dark:border-slate-800 pt-4 bg-white dark:bg-slate-900">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 px-1">Add Section</p>
        <div className="grid grid-cols-2 gap-2">
          {(Object.keys(SECTION_ICONS) as SectionType[]).map((type) => (
            <button
              key={type}
              onClick={() => addSection(type)}
              className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 hover:border-brand-500 dark:hover:border-brand-500 hover:bg-brand-50/30 dark:hover:bg-brand-900/10 transition-all text-xs font-medium text-slate-600 dark:text-slate-400 group"
            >
              <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 group-hover:bg-brand-100 dark:group-hover:bg-brand-900/30 group-hover:text-brand-600 transition-colors">
                {(() => {
                  const Icon = SECTION_ICONS[type];
                  return <Icon className="w-4 h-4" />;
                })()}
              </div>
              <span className="text-[10px] truncate w-full px-1">{getLabel(type)}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
