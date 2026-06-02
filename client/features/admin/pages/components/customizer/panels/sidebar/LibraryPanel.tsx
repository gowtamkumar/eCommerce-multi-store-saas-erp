import type { CustomizerSection, SectionType } from '@/types/customizer';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import BlockInserter from '../BlockInserter';

interface LibraryPanelProps {
  recent: SectionType[];
  onSelect: (type: SectionType) => void;
  onSelectSaved: (block: CustomizerSection | CustomizerSection[]) => void;
}

/**
 * Collapsible block library at the bottom of the layers sidebar. The
 * panel is open by default — it's the primary way new users discover
 * blocks. Persisted-open state is intentionally local: the panel is
 * compact enough that re-opening it on reload is rarely a friction point.
 */
export default function LibraryPanel({ recent, onSelect, onSelectSaved }: LibraryPanelProps) {
  const [open, setOpen] = useState(true);

  return (
    <div className="shrink-0 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-all duration-300">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-1 py-3 group"
      >
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest group-hover:text-brand-600 transition-colors">
          Library
        </p>
        {open ? (
          <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-brand-600 transition-colors" />
        ) : (
          <ChevronUp className="w-4 h-4 text-slate-400 group-hover:text-brand-600 transition-colors" />
        )}
      </button>

      <div
        className={`transition-all duration-300 overflow-hidden ${
          open ? 'max-h-[420px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <BlockInserter recent={recent} onSelect={onSelect} onSelectSaved={onSelectSaved} />
      </div>
    </div>
  );
}
