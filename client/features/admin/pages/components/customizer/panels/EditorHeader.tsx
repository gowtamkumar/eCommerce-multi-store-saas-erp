"use client";

import type { SaveStatus } from '@/features/admin/pages/components/customizer/hooks/usePageEditorState';
import {
  ArrowLeft,
  Eye,
  Monitor,
  Redo2,
  Save,
  Smartphone,
  Tablet,
  Undo2,
} from 'lucide-react';
import Link from 'next/link';

export type ViewMode = 'desktop' | 'tablet' | 'mobile';

interface EditorHeaderProps {
  title: string;
  isDirty: boolean;
  saveStatus: SaveStatus;
  hasSchedule: boolean;
  canUndo: boolean;
  canRedo: boolean;
  viewMode: ViewMode;
  previewPath: string;
  onUndo: () => void;
  onRedo: () => void;
  onViewModeChange: (mode: ViewMode) => void;
  onSave: () => void;
}

const VIEW_MODE_ICON = {
  desktop: Monitor,
  tablet: Tablet,
  mobile: Smartphone,
} satisfies Record<ViewMode, typeof Monitor>;

const VIEW_MODES: ViewMode[] = ['desktop', 'tablet', 'mobile'];

/**
 * Top bar of the page editor — title, undo/redo, viewport picker, preview
 * link, save button. Extracted from CustomizerEditor to keep the parent
 * focused on state wiring rather than chrome.
 */
export default function EditorHeader({
  title,
  isDirty,
  saveStatus,
  hasSchedule,
  canUndo,
  canRedo,
  viewMode,
  previewPath,
  onUndo,
  onRedo,
  onViewModeChange,
  onSave,
}: EditorHeaderProps) {
  const saveLabel =
    saveStatus === 'saving' ? 'Saving…' : saveStatus === 'unsaved' ? 'Save' : 'Saved';

  return (
    <header className="h-14 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 shrink-0 z-50">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/pages"
          onClick={(e) => {
            if (isDirty && !window.confirm('You have unsaved changes. Leave without saving?')) {
              e.preventDefault();
            }
          }}
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="font-bold text-sm leading-none">{title || 'Untitled page'}</h1>
          <p className="text-[10px] text-slate-500 uppercase tracking-wider mt-1 font-bold">
            Page Builder
            {isDirty && <span className="ml-2 text-amber-600">· Unsaved</span>}
            {saveStatus === 'saved' && !isDirty && (
              <span className="ml-2 text-green-600">· Saved</span>
            )}
            {hasSchedule && <span className="ml-2 text-blue-600">· Scheduled</span>}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
          <button
            type="button"
            onClick={onUndo}
            disabled={!canUndo}
            title="Undo (Cmd+Z)"
            className="p-1.5 rounded-md text-slate-600 hover:bg-white dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onRedo}
            disabled={!canRedo}
            title="Redo (Cmd+Shift+Z)"
            className="p-1.5 rounded-md text-slate-600 hover:bg-white dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Redo2 className="w-4 h-4" />
          </button>
        </div>
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
          {VIEW_MODES.map((mode) => {
            const Icon = VIEW_MODE_ICON[mode];
            const active = viewMode === mode;
            return (
              <button
                key={mode}
                type="button"
                onClick={() => onViewModeChange(mode)}
                title={mode}
                className={`p-1.5 rounded-md transition-all ${
                  active
                    ? 'bg-white dark:bg-slate-700 shadow-sm text-brand-600'
                    : 'text-slate-500'
                }`}
              >
                <Icon className="w-4 h-4" />
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Link
          href={previewPath}
          target="_blank"
          className="flex items-center gap-2 px-3 py-1.5 text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
        >
          <Eye className="w-4 h-4" />
          Preview
        </Link>
        <button
          type="button"
          onClick={onSave}
          disabled={saveStatus === 'saving'}
          className="flex items-center gap-2 px-6 py-1.5 text-sm font-bold bg-brand-600 hover:bg-brand-700 text-white rounded-lg transition-all shadow-lg shadow-brand-600/20 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saveLabel}
        </button>
      </div>
    </header>
  );
}
