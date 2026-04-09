"use client";

import { Monitor, Smartphone, Trash2, Plus } from 'lucide-react';
import React, { useState } from 'react';
import DebouncedInput from '../DebouncedInput';

interface GridEditorProps {
  section: any;
  categories: any[];
  brands: any[];
  viewMode: 'desktop' | 'mobile';
  onUpdate: (key: string, value: any) => void;
  updateArrayItem: (key: string, itemId: string, itemData: any) => void;
  addArrayItem: (key: string, defaultItem: any) => void;
  removeArrayItem: (key: string, itemId: string) => void;
}

const GridEditor = React.memo(({
  section,
  categories,
  brands,
  viewMode,
  onUpdate,
  updateArrayItem,
  addArrayItem,
  removeArrayItem
}: GridEditorProps) => {
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const settings = section.settings || {};
  const isCategory = section.type === 'category-grid';
  const dataList = isCategory ? categories : brands;
  const itemLabel = isCategory ? 'Category' : 'Brand';

  const toggleExpand = (id: string) => {
    setExpandedItems(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <label className="text-[10px] font-bold text-slate-500 uppercase">Section Title</label>
        <DebouncedInput
          type="text"
          value={settings?.title || ''}
          onChange={(val) => onUpdate('title', val)}
          className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
          placeholder={`e.g. Explore ${itemLabel}s`}
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-[10px] font-bold text-slate-500 uppercase">Selection Source</label>
        <select
          value={settings?.source || 'all'}
          onChange={(e) => onUpdate('source', e.target.value)}
          className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
        >
          <option value="all">All {itemLabel}s</option>
          <option value="manual">Manual Selection</option>
        </select>
      </div>

      {settings?.source === 'manual' ? (
        <div className="space-y-4">
          <label className="text-[10px] font-bold text-slate-500 uppercase">Selected {itemLabel}s</label>
          {(settings?.items || []).map((item: any, index: number) => (
            <div key={item.id} className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-800/50 shadow-sm">
              <button
                onClick={() => toggleExpand(item.id)}
                className="w-full px-4 py-2 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <span className="text-xs font-bold truncate">
                  {dataList.find(d => d.id === item.link)?.name || `Select ${itemLabel}...`}
                </span>
                <Trash2
                  className="w-3 h-3 text-red-400 hover:text-red-600"
                  onClick={(e) => { e.stopPropagation(); removeArrayItem('items', item.id); }}
                />
              </button>
              {expandedItems.includes(item.id) && (
                <div className="p-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
                  <select
                    value={item.link || ''}
                    onChange={(e) => updateArrayItem('items', item.id, { link: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border"
                  >
                    <option value="">Choose {itemLabel}...</option>
                    {dataList.map((d: any) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          ))}
          <button
            onClick={() => addArrayItem('items', { label: itemLabel, link: '' })}
            className="w-full py-2 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-[10px] font-bold text-slate-500 hover:border-brand-500 hover:text-brand-600 transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add {itemLabel}
          </button>
        </div>
      ) : (
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-500 uppercase">{itemLabel}s Count</label>
          <DebouncedInput
            type="number"
            value={settings?.count || 6}
            onChange={(val) => onUpdate('count', parseInt(val))}
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
            min="1"
            max="20"
          />
        </div>
      )}

      <div className="space-y-1.5 pt-4 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-1.5 mb-1.5">
          <label className="text-[10px] font-bold text-slate-500 uppercase">Items per row</label>
          {viewMode === 'mobile' ? <Smartphone className="w-2.5 h-2.5 text-brand-500" /> : <Monitor className="w-2.5 h-2.5 text-slate-300" />}
        </div>
        <select
          value={viewMode === 'mobile' ? (settings?.mobileColumns || 2) : (settings?.columns || 3)}
          onChange={(e) => onUpdate(viewMode === 'mobile' ? 'mobileColumns' : 'columns', parseInt(e.target.value))}
          className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
        >
          {[1, 2, 3, 4, 5, 6, 8, 10].map(c => <option key={c} value={c}>{c} Columns</option>)}
        </select>
      </div>
    </div>
  );
});

export default GridEditor;
