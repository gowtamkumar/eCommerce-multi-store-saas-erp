"use client";

import { Search, X } from 'lucide-react';
import dynamicIconImports from 'lucide-react/dynamicIconImports';
import { useMemo, useState } from 'react';
import LucideIcon from '../LucideIcon';

interface IconPickerProps {
  value: string;
  onChange: (value: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

const allIconNames = Object.keys(dynamicIconImports);

const IconPicker = ({ value, onChange, isOpen, onClose }: IconPickerProps) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredIcons = useMemo(() => {
    return allIconNames
      .filter(name => name.toLowerCase().includes(searchTerm.toLowerCase()))
      .slice(0, 100); // Limit to 100 for performance
  }, [searchTerm]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col max-h-[80vh]">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            Select Icon
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search icons (e.g., shopping, heart, star)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
              className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3 overflow-y-auto pr-2 max-h-[400px] scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
            {filteredIcons.map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => {
                  onChange(name);
                  onClose();
                }}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all group ${value === name
                    ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20'
                    : 'border-transparent bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
              >
                <div className={`w-8 h-8 flex items-center justify-center ${value === name ? 'text-brand-600 dark:text-brand-400' : 'text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white'
                  }`}>
                  <LucideIcon name={name} className="w-6 h-6" />
                </div>
                <span className="text-[10px] mt-2 font-medium truncate w-full text-center text-slate-500">
                  {name}
                </span>
              </button>
            ))}

            {filteredIcons.length === 0 && (
              <div className="col-span-full py-12 text-center text-slate-500">
                No icons found for "{searchTerm}"
              </div>
            )}
          </div>

          <div className="mt-4 text-center">
            <p className="text-xs text-slate-400">
              Showing {filteredIcons.length} of {allIconNames.length} available icons
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IconPicker;
