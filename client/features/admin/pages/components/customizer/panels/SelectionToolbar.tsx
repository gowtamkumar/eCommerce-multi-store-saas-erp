"use client";

import { CustomizerSection } from '@/types/customizer';
import { ArrowDown, ArrowUp, Copy, Eye, EyeOff, Lock, Trash2, Unlock } from 'lucide-react';
import React from 'react';

export interface SelectionToolbarProps {
  section: CustomizerSection;
  onDuplicate: () => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onToggleHidden: () => void;
  onToggleLocked: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}

const btn =
  'h-7 w-7 inline-flex items-center justify-center rounded-md text-white/90 hover:text-white hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed';

const SelectionToolbar: React.FC<SelectionToolbarProps> = ({
  section,
  onDuplicate,
  onDelete,
  onMoveUp,
  onMoveDown,
  onToggleHidden,
  onToggleLocked,
  canMoveUp,
  canMoveDown,
}) => {
  return (
    <div
      className="absolute -top-9 left-0 z-20 flex items-center gap-0.5 px-1 py-1 rounded-md bg-brand-600 shadow-lg pointer-events-auto"
      onClick={(e) => e.stopPropagation()}
    >
      <span className="px-2 text-[10px] font-bold uppercase tracking-wider text-white/90 select-none">
        {section.name || section.type.replace('-', ' ')}
      </span>

      <button type="button" className={btn} title="Move up" disabled={!canMoveUp} onClick={onMoveUp}>
        <ArrowUp className="w-3.5 h-3.5" />
      </button>
      <button
        type="button"
        className={btn}
        title="Move down"
        disabled={!canMoveDown}
        onClick={onMoveDown}
      >
        <ArrowDown className="w-3.5 h-3.5" />
      </button>
      <button type="button" className={btn} title="Duplicate (Cmd+D)" onClick={onDuplicate}>
        <Copy className="w-3.5 h-3.5" />
      </button>
      <button
        type="button"
        className={btn}
        title={section.hidden ? 'Show' : 'Hide'}
        onClick={onToggleHidden}
      >
        {section.hidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
      </button>
      <button
        type="button"
        className={btn}
        title={section.locked ? 'Unlock' : 'Lock'}
        onClick={onToggleLocked}
      >
        {section.locked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
      </button>
      <button
        type="button"
        className={`${btn} hover:bg-red-500 hover:text-white`}
        title="Delete (Del)"
        onClick={onDelete}
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

export default SelectionToolbar;
