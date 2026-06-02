import React from 'react';
import type { LooseRecord, StyleChange, ViewMode } from './types';

type LayoutPreset = 'container' | 'container-full' | 'grid';

const PRESET_ICONS: Record<LayoutPreset, React.ReactNode> = {
  container: (
    <svg viewBox="0 0 40 24" className="w-10 h-6">
      <rect
        x="4"
        y="2"
        width="32"
        height="20"
        rx="2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <rect x="7" y="5" width="26" height="14" rx="1" fill="currentColor" fillOpacity="0.15" />
    </svg>
  ),
  'container-full': (
    <svg viewBox="0 0 40 24" className="w-10 h-6">
      <rect
        x="1"
        y="2"
        width="38"
        height="20"
        rx="2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <rect x="1" y="2" width="38" height="20" rx="2" fill="currentColor" fillOpacity="0.15" />
    </svg>
  ),
  grid: (
    <svg viewBox="0 0 40 24" className="w-10 h-6">
      <rect
        x="2"
        y="2"
        width="11"
        height="20"
        rx="1.5"
        fill="currentColor"
        fillOpacity="0.2"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <rect
        x="15"
        y="2"
        width="11"
        height="20"
        rx="1.5"
        fill="currentColor"
        fillOpacity="0.2"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <rect
        x="28"
        y="2"
        width="11"
        height="20"
        rx="1.5"
        fill="currentColor"
        fillOpacity="0.2"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  ),
};

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

interface LayoutPresetPickerProps {
  styles: LooseRecord;
  onChange: StyleChange;
  onBatchChange?: (updates: LooseRecord) => void;
  viewMode: ViewMode;
}

/**
 * Three-button preset picker shown only on Row blocks.
 *
 * The presets apply multi-field updates atomically when possible (via
 * `onBatchChange`) so the user sees one undo entry per click instead of
 * one entry per CSS field. For the mobile viewport we write the mobile-
 * prefixed keys so desktop layouts aren't accidentally overwritten.
 */
export default function LayoutPresetPicker({
  styles,
  onChange,
  onBatchChange,
  viewMode,
}: LayoutPresetPickerProps) {
  const current = styles.layoutPreset as LayoutPreset | undefined;
  const isMobile = viewMode === 'mobile';
  const k = (key: string) => (isMobile ? `mobile${cap(key)}` : key);

  const applyPreset = (preset: LayoutPreset) => {
    const updates: LooseRecord = { layoutPreset: preset };

    if (preset === 'container') {
      Object.assign(updates, {
        [k('display')]: 'flex',
        maxWidth: '1280px',
        width: '100%',
        marginLeft: 'auto',
        marginRight: 'auto',
        paddingLeft: '16px',
        paddingRight: '16px',
        [k('gridTemplateColumns')]: '',
      });
    } else if (preset === 'container-full') {
      Object.assign(updates, {
        [k('display')]: 'flex',
        maxWidth: '100%',
        width: '100%',
        marginLeft: '',
        marginRight: '',
        paddingLeft: '',
        paddingRight: '',
        [k('gridTemplateColumns')]: '',
      });
    } else if (preset === 'grid') {
      const cols = isMobile ? styles.mobileGridColumns || 1 : styles.gridColumns || 3;
      Object.assign(updates, {
        [k('display')]: 'grid',
        [k('gridTemplateColumns')]: `repeat(${cols}, 1fr)`,
        maxWidth: '1280px',
        marginLeft: 'auto',
        marginRight: 'auto',
      });
    }

    if (onBatchChange) onBatchChange(updates);
    else Object.entries(updates).forEach(([key, v]) => onChange(key, v));
  };

  return (
    <div className="space-y-3">
      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
        Layout Preset
      </p>
      <div className="grid grid-cols-3 gap-2">
        {(['container', 'container-full', 'grid'] as LayoutPreset[]).map((preset) => (
          <button
            key={preset}
            type="button"
            onClick={() => applyPreset(preset)}
            className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border-2 transition-all ${
              current === preset
                ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400'
                : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-300 hover:text-slate-700'
            }`}
          >
            {PRESET_ICONS[preset]}
            <span className="text-[9px] font-bold uppercase leading-none">
              {preset === 'container-full' ? 'Full Width' : cap(preset)}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
