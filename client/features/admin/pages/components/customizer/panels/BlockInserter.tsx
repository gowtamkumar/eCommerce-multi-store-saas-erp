"use client";

import {
  CONTENT_TYPES,
  getBlockDefinition,
  STRUCTURAL_TYPES,
  type SectionCategory,
} from '@/features/admin/pages/components/customizer/blocks';
import { CustomizerSection, SectionType } from '@/types/customizer';
import { fetchAPI } from '@/services/api';
import { 
  Layers, 
  Search, 
  Trash2, 
  X, 
  Clock, 
  Bookmark, 
  LayoutGrid, 
  ShoppingBag, 
  FileText, 
  Image, 
  Megaphone 
} from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ConfirmModal from '@/components/shared/ConfirmModal';
import { toast } from 'react-hot-toast';

const CATEGORIES: ('Recent' | 'Saved' | 'Layout' | SectionCategory)[] = [
  'Recent',
  'Saved',
  'Layout',
  'Commerce',
  'Content',
  'Media',
  'Marketing',
];

const CATEGORY_ICONS: Record<string, React.ComponentType<any>> = {
  Recent: Clock,
  Saved: Bookmark,
  Layout: LayoutGrid,
  Commerce: ShoppingBag,
  Content: FileText,
  Media: Image,
  Marketing: Megaphone,
};

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
    if (activeCategory === 'Saved') loadSavedBlocks();
  }, [activeCategory, loadSavedBlocks]);

  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    id: string;
  }>({
    isOpen: false,
    id: '',
  });

  const handleDeleteConfirm = useCallback(async () => {
    const id = deleteConfirm.id;
    if (!id) return;
    try {
      const res = await fetchAPI(`/pages/reusable-blocks/${id}`, { method: 'DELETE' });
      if (res?.success) {
        setSavedBlocks((prev) => prev.filter((b) => b.id !== id));
        toast.success('Template deleted successfully');
      } else {
        toast.error(res?.message || 'Failed to delete template');
      }
    } catch (err: any) {
      console.error(err);
      toast.error('An error occurred while deleting');
    } finally {
      setDeleteConfirm({ isOpen: false, id: '' });
    }
  }, [deleteConfirm.id]);

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
          ? 'flex flex-col h-full bg-slate-50/30 dark:bg-slate-900/30'
          : 'w-[360px] max-h-[460px] flex flex-col rounded-2xl border border-slate-200/85 dark:border-slate-850 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl shadow-2xl overflow-hidden transition-all duration-300'
      }
    >
      <div className="p-4 border-b border-slate-100 dark:border-slate-800/80 flex flex-col gap-3">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-455 dark:text-slate-500 transition-colors group-focus-within:text-brand-500" />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search elements & templates..."
            className="w-full pl-9 pr-9 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 focus:bg-white dark:focus:bg-slate-900 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 font-medium"
          />
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              aria-label="Close"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        {!query && (
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 -mx-2 px-2">
            {CATEGORIES.map((cat) => {
              if (cat === 'Recent' && recent.length === 0) return null;
              if (cat === 'Saved' && !onSelectSaved) return null;
              const isActive = activeCategory === cat;
              const Icon = CATEGORY_ICONS[cat] || LayoutGrid;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold tracking-wide rounded-lg transition-all duration-200 whitespace-nowrap border ${
                    isActive
                      ? 'bg-brand-500 text-white border-brand-500 shadow-lg shadow-brand-500/15'
                      : 'bg-white dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500'}`} />
                  {cat}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-3 no-scrollbar">
        {activeCategory === 'Saved' && !query ? (
          savedBlocks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <Bookmark className="w-8 h-8 text-slate-300 dark:text-slate-700 mb-2.5 animate-pulse" />
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">No saved templates</p>
              <p className="text-[10px] text-slate-400 mt-1 max-w-[200px] leading-normal">
                {savedLoaded ? 'Save any section from the canvas to reuse it across your store pages.' : 'Fetching blocks…'}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {savedBlocks.map((b) => (
                <div
                  key={b.id}
                  className="group relative flex items-center gap-3 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900/50 hover:border-brand-500 dark:hover:border-brand-500 hover:bg-brand-50/30 dark:hover:bg-brand-950/10 shadow-sm transition-all duration-250"
                >
                  <div className="w-8 h-8 rounded-lg bg-brand-50 dark:bg-brand-950/40 flex items-center justify-center shrink-0 text-brand-500 group-hover:scale-105 transition-transform duration-200">
                    <Layers className="w-4 h-4" />
                  </div>
                  <button
                    type="button"
                    onClick={() => onSelectSaved?.(b.payload)}
                    className="flex-1 min-w-0 text-left cursor-pointer"
                  >
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                      {b.name}
                    </p>
                    {b.description && (
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate mt-0.5 font-medium">{b.description}</p>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteConfirm({ isOpen: true, id: b.id });
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-rose-500 dark:hover:text-rose-450 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition-all"
                    aria-label="Delete saved block"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )
        ) : items.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xs font-bold text-slate-400">No matching elements found</p>
            <p className="text-[10px] text-slate-400/80 mt-1">Try searching for a different keyword</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {items.map((entry) => {
              const Icon = entry.icon;
              return (
                <button
                  key={entry.type}
                  type="button"
                  onClick={() => onSelect(entry.type)}
                  className="group flex flex-col items-center justify-center gap-2 p-3.5 rounded-xl border border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900/50 hover:border-brand-500 dark:hover:border-brand-500 hover:bg-brand-50/30 dark:hover:bg-brand-950/10 shadow-sm transition-all duration-250 cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-500 dark:text-slate-400 group-hover:bg-brand-500 group-hover:text-white group-hover:scale-110 transition-all duration-250">
                    <Icon className="w-4.5 h-4.5" />
                  </div>
                  <span className="text-[11px] font-bold text-center text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                    {entry.label}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, id: '' })}
        onConfirm={handleDeleteConfirm}
        title="Delete Template"
        message="Are you sure you want to delete this saved template? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        isDangerous
      />
    </div>
  );
};

export default BlockInserter;
