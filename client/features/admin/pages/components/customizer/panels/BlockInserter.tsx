"use client";

import {
  CONTENT_TYPES,
  getBlockDefinition,
  STRUCTURAL_TYPES,
  type SectionCategory,
} from '@/features/admin/pages/components/customizer/blocks';
import { CustomizerSection, SectionType } from '@/types/customizer';
import { fetchAPI } from '@/services/api';
import { Layers, Search, Trash2, X } from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const CATEGORIES: ('Recent' | 'Saved' | 'Layout' | SectionCategory)[] = [
  'Recent',
  'Saved',
  'Layout',
  'Commerce',
  'Content',
  'Media',
  'Marketing',
];

interface ReusableBlock {
  id: string;
  name: string;
  description?: string;
  category?: string;
  payload: CustomizerSection | CustomizerSection[];
}

export interface BlockInserterProps {
  query?: string;
  recent?: SectionType[];
  onSelect: (type: SectionType) => void;
  /** When provided, allows inserting a saved block directly. */
  onSelectSaved?: (block: CustomizerSection | CustomizerSection[]) => void;
  onClose?: () => void;
  layout?: 'panel' | 'menu';
}

const BlockInserter: React.FC<BlockInserterProps> = ({
  query: initialQuery = '',
  recent = [],
  onSelect,
  onSelectSaved,
  onClose,
  layout = 'panel',
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [activeCategory, setActiveCategory] = useState<typeof CATEGORIES[number]>(
    recent.length ? 'Recent' : 'Layout',
  );
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [savedBlocks, setSavedBlocks] = useState<ReusableBlock[]>([]);
  const [savedLoaded, setSavedLoaded] = useState(false);

  const loadSavedBlocks = useCallback(() => {
    fetchAPI('/pages/reusable-blocks')
      .then((res) => {
        if (res?.success) setSavedBlocks(res.data || []);
      })
      .finally(() => setSavedLoaded(true));
  }, []);

  useEffect(() => {
    if (activeCategory === 'Saved' && !savedLoaded) loadSavedBlocks();
  }, [activeCategory, savedLoaded, loadSavedBlocks]);

  const deleteSaved = useCallback(async (id: string) => {
    if (!window.confirm('Delete this saved block?')) return;
    const res = await fetchAPI(`/pages/reusable-blocks/${id}`, { method: 'DELETE' });
    if (res?.success) {
      setSavedBlocks((prev) => prev.filter((b) => b.id !== id));
    }
  }, []);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  const allEntries = useMemo(() => {
    const types = Array.from(new Set([...STRUCTURAL_TYPES, ...CONTENT_TYPES]));
    return types.map((t) => getBlockDefinition(t));
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allEntries.filter((entry) => {
      if (q) {
        if (!entry.label.toLowerCase().includes(q) && !entry.type.includes(q)) return false;
      }
      if (q) return true;
      if (activeCategory === 'Recent') {
        return recent.includes(entry.type);
      }
      if (activeCategory === 'Layout') {
        return entry.category === 'Layout';
      }
      return entry.category === activeCategory;
    });
  }, [allEntries, query, activeCategory, recent]);

  const items =
    activeCategory === 'Recent' && !query
      ? recent.map((t) => getBlockDefinition(t)).filter(Boolean)
      : filtered;

  return (
    <div
      className={
        layout === 'panel'
          ? 'flex flex-col h-full'
          : 'w-[360px] max-h-[420px] flex flex-col rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden'
      }
    >
      <div className="p-3 border-b border-slate-100 dark:border-slate-800">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search blocks..."
            className="w-full pl-8 pr-8 py-1.5 text-xs rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-1 focus:ring-brand-500 outline-none"
          />
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="absolute right-1 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
              aria-label="Close"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        {!query && (
          <div className="flex flex-wrap gap-1 mt-2">
            {CATEGORIES.map((cat) => {
              if (cat === 'Recent' && recent.length === 0) return null;
              if (cat === 'Saved' && !onSelectSaved) return null;
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded ${
                    isActive
                      ? 'bg-brand-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {activeCategory === 'Saved' && !query ? (
          savedBlocks.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-6">
              {savedLoaded ? 'No saved blocks yet. Save a section from the canvas.' : 'Loading…'}
            </p>
          ) : (
            <div className="space-y-1.5">
              {savedBlocks.map((b) => (
                <div
                  key={b.id}
                  className="group flex items-center gap-2 p-2 rounded-md border border-slate-200 dark:border-slate-800 hover:border-brand-500 hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors"
                >
                  <Layers className="w-4 h-4 text-brand-500 shrink-0" />
                  <button
                    type="button"
                    onClick={() => onSelectSaved?.(b.payload)}
                    className="flex-1 min-w-0 text-left"
                  >
                    <p className="text-[11px] font-bold text-slate-700 dark:text-slate-200 truncate">
                      {b.name}
                    </p>
                    {b.description && (
                      <p className="text-[10px] text-slate-400 truncate">{b.description}</p>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteSaved(b.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500"
                    aria-label="Delete saved block"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )
        ) : items.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-6">No matching blocks</p>
        ) : (
          <div className="grid grid-cols-2 gap-1.5">
            {items.map((entry) => {
              const Icon = entry.icon;
              return (
                <button
                  key={entry.type}
                  type="button"
                  onClick={() => onSelect(entry.type)}
                  className="flex flex-col items-center justify-center gap-1.5 p-2 rounded-md border border-slate-200 dark:border-slate-800 hover:border-brand-500 hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors"
                >
                  <Icon className="w-4 h-4 text-slate-500 group-hover:text-brand-600" />
                  <span className="text-[10px] font-bold text-center text-slate-700 dark:text-slate-300">
                    {entry.label}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default BlockInserter;
