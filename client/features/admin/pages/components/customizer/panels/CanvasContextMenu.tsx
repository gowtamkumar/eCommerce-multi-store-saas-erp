"use client";

import { CustomizerSection } from '@/types/customizer';
import {
  ArrowDown,
  ArrowUp,
  Clipboard,
  Copy,
  Eye,
  EyeOff,
  Lock,
  Plus,
  Trash2,
  Unlock,
} from 'lucide-react';
import React, { useEffect, useRef } from 'react';

export interface ContextMenuPosition {
  x: number;
  y: number;
  sectionId: string;
}

export interface CanvasContextMenuProps {
  position: ContextMenuPosition;
  section: CustomizerSection;
  canPaste: boolean;
  onClose: () => void;
  onDuplicate: () => void;
  onCopy: () => void;
  onPaste: () => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onToggleHidden: () => void;
  onToggleLocked: () => void;
  onInsertChild: () => void;
}

const item =
  'w-full text-left flex items-center gap-2 px-3 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed';

const CanvasContextMenu: React.FC<CanvasContextMenuProps> = ({
  position,
  section,
  canPaste,
  onClose,
  onDuplicate,
  onCopy,
  onPaste,
  onDelete,
  onMoveUp,
  onMoveDown,
  onToggleHidden,
  onToggleLocked,
  onInsertChild,
}) => {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) onClose();
    };
    const escHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('mousedown', handler);
    document.addEventListener('keydown', escHandler);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('keydown', escHandler);
    };
  }, [onClose]);

  return (
    <div
      ref={ref}
      style={{ top: position.y, left: position.x }}
      className="fixed z-[200] min-w-[200px] py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xl"
    >
      <button type="button" className={item} onClick={onCopy}>
        <Copy className="w-3.5 h-3.5" /> Copy
        <span className="ml-auto text-[10px] text-slate-400">Cmd C</span>
      </button>
      <button type="button" className={item} onClick={onPaste} disabled={!canPaste}>
        <Clipboard className="w-3.5 h-3.5" /> Paste
        <span className="ml-auto text-[10px] text-slate-400">Cmd V</span>
      </button>
      <button type="button" className={item} onClick={onDuplicate}>
        <Copy className="w-3.5 h-3.5" /> Duplicate
        <span className="ml-auto text-[10px] text-slate-400">Cmd D</span>
      </button>
      <div className="h-px my-1 bg-slate-100 dark:bg-slate-800" />
      <button type="button" className={item} onClick={onMoveUp}>
        <ArrowUp className="w-3.5 h-3.5" /> Move up
      </button>
      <button type="button" className={item} onClick={onMoveDown}>
        <ArrowDown className="w-3.5 h-3.5" /> Move down
      </button>
      {['section', 'row', 'column'].includes(section.type) && (
        <button type="button" className={item} onClick={onInsertChild}>
          <Plus className="w-3.5 h-3.5" /> Insert inside
        </button>
      )}
      <div className="h-px my-1 bg-slate-100 dark:bg-slate-800" />
      <button type="button" className={item} onClick={onToggleHidden}>
        {section.hidden ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
        {section.hidden ? 'Show' : 'Hide'}
      </button>
      <button type="button" className={item} onClick={onToggleLocked}>
        {section.locked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
        {section.locked ? 'Unlock' : 'Lock'}
      </button>
      <div className="h-px my-1 bg-slate-100 dark:bg-slate-800" />
      <button
        type="button"
        className={`${item} text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20`}
        onClick={onDelete}
      >
        <Trash2 className="w-3.5 h-3.5" /> Delete
        <span className="ml-auto text-[10px] text-slate-400">Del</span>
      </button>
    </div>
  );
};

export default CanvasContextMenu;
