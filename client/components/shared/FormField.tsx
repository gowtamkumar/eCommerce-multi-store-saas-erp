'use client';

import { ReactNode } from 'react';

/** Shared control surface styling reused by inputs, selects and textareas in admin forms. */
export const fieldControlClass =
  'w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all';

export interface FormFieldProps {
  label: ReactNode;
  children: ReactNode;
  hint?: ReactNode;
  className?: string;
}

/** Label + control wrapper that standardises spacing and the uppercase label treatment. */
export default function FormField({ label, children, hint, className = '' }: FormFieldProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 block">
        {label}
      </label>
      {children}
      {hint}
    </div>
  );
}
