"use client";

import { ChevronDown, ChevronRight, Monitor, Smartphone } from 'lucide-react';
import React, { useState } from 'react';

export type ViewMode = 'desktop' | 'tablet' | 'mobile';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyValue = any;

// ─── Label ─────────────────────────────────────────────────────────────
export function Label({
  children,
  isResponsive,
  viewMode,
}: {
  children: React.ReactNode;
  isResponsive?: boolean;
  viewMode?: ViewMode;
}) {
  return (
    <div className="flex items-center gap-1.5 mb-1.5">
      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{children}</p>
      {isResponsive &&
        (viewMode === 'mobile' ? (
          <Smartphone className="w-2.5 h-2.5 text-brand-500" />
        ) : (
          <Monitor className="w-2.5 h-2.5 text-slate-300" />
        ))}
    </div>
  );
}

// ─── Inputs ────────────────────────────────────────────────────────────
const INPUT_CLS =
  'w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-500';

export function TextInput({
  value,
  onChange,
  placeholder,
}: {
  value: AnyValue;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <input
      type="text"
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder || '—'}
      className={INPUT_CLS}
    />
  );
}

export function NumberInput({
  value,
  onChange,
  unit = 'px',
  min,
  max,
  placeholder = '—',
}: {
  value: AnyValue;
  onChange: (v: string) => void;
  unit?: string;
  min?: number;
  max?: number;
  placeholder?: string;
}) {
  const raw = typeof value === 'string' ? value?.replace(/[^0-9.-]/g, '') : value;
  return (
    <div className="flex">
      <input
        type="number"
        value={raw ?? ''}
        min={min}
        max={max}
        onChange={(e) => onChange(e.target.value ? `${e.target.value}${unit}` : '')}
        placeholder={placeholder}
        className={`${INPUT_CLS} rounded-r-none border-r-0`}
      />
      <span className="px-2 py-1.5 text-[10px] text-slate-400 bg-slate-50 dark:bg-slate-800 border border-l-0 border-slate-200 dark:border-slate-700 rounded-r-lg select-none">
        {unit}
      </span>
    </div>
  );
}

export function Select({
  value,
  onChange,
  options,
}: {
  value: AnyValue;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <select value={value ?? ''} onChange={(e) => onChange(e.target.value)} className={INPUT_CLS}>
      <option value="">—</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

export function ColorInput({
  value,
  onChange,
}: {
  value: AnyValue;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex gap-2 items-center">
      <input
        type="color"
        value={typeof value === 'string' && value.startsWith('#') ? value : '#000000'}
        onChange={(e) => onChange(e.target.value)}
        className="h-7 w-10 rounded cursor-pointer border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
      />
      <input
        type="text"
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder="#000000 / rgba(...)"
        className={`${INPUT_CLS} flex-1`}
      />
    </div>
  );
}

export function SliderInput({
  value,
  onChange,
  min,
  max,
  step,
  format,
}: {
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step?: number;
  format?: (v: number) => string;
}) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="flex-1 accent-brand-600"
      />
      <span className="text-xs text-slate-500 w-12 text-right">
        {format ? format(value) : value}
      </span>
    </div>
  );
}

// ─── Field row ─────────────────────────────────────────────────────────
export function InputRow({
  label,
  children,
  isResponsive,
  viewMode,
}: {
  label: string;
  children: React.ReactNode;
  isResponsive?: boolean;
  viewMode?: ViewMode;
}) {
  return (
    <div className="space-y-1">
      <Label isResponsive={isResponsive} viewMode={viewMode}>
        {label}
      </Label>
      {children}
    </div>
  );
}

// ─── Side-by-side 4-side spacing ───────────────────────────────────────
export function FourSideInput({
  label,
  prop,
  read,
  write,
  isResponsive,
  viewMode,
}: {
  label: string;
  prop: string;
  read: (key: string) => AnyValue;
  write: (key: string, value: AnyValue) => void;
  isResponsive?: boolean;
  viewMode?: ViewMode;
}) {
  const sides = ['Top', 'Right', 'Bottom', 'Left'] as const;
  return (
    <div>
      <Label isResponsive={isResponsive} viewMode={viewMode}>
        {label}
      </Label>
      <div className="grid grid-cols-2 gap-1.5">
        {sides.map((side) => (
          <div key={side} className="space-y-0.5">
            <p className="text-[8px] text-slate-400 capitalize">{side}</p>
            <NumberInput
              value={read(`${prop}${side}`) ?? ''}
              onChange={(v) => write(`${prop}${side}`, v)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Group accordion ───────────────────────────────────────────────────
export function Group({
  title,
  emoji,
  children,
  defaultOpen = false,
}: {
  title: string;
  emoji: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-3 py-2.5 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm">{emoji}</span>
          <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            {title}
          </span>
        </div>
        {open ? (
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        ) : (
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        )}
      </button>
      {open && <div className="p-3 space-y-3 bg-white dark:bg-slate-900">{children}</div>}
    </div>
  );
}

// ─── Responsive style accessor ─────────────────────────────────────────
/**
 * Shared helper: in mobile view, reads/writes the `mobile<Key>` variant of
 * a style key, falling back to the desktop value for display. Tablet currently
 * falls back to desktop (no separate write path yet).
 */
export function useResponsiveStyle(
  styles: Record<string, AnyValue>,
  viewMode: ViewMode,
  onChange: (key: string, value: AnyValue) => void,
) {
  const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  const read = (key: string): AnyValue => {
    if (viewMode === 'mobile') {
      const mobileKey = `mobile${cap(key)}`;
      const mobileVal = styles[mobileKey];
      if (mobileVal !== undefined && mobileVal !== '') return mobileVal;
    }
    return styles[key];
  };

  const write = (key: string, value: AnyValue) => {
    if (viewMode === 'mobile') {
      onChange(`mobile${cap(key)}`, value);
    } else {
      onChange(key, value);
    }
  };

  return { read, write };
}
