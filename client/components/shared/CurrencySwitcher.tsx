'use client';

import { useSettings } from '@/hooks/SettingsContext';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, Globe } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const CurrencySwitcher = () => {
  const { settings, selectedCurrency, setCurrency } = useSettings();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!settings?.supportedCurrencies || settings.supportedCurrencies.length <= 1) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700 group"
      >
        <Globe className="w-4 h-4 text-slate-500 group-hover:text-blue-600 transition-colors" />
        <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
          {selectedCurrency.code} ({selectedCurrency.symbol})
        </span>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 py-2 z-[100]"
          >
            {settings.supportedCurrencies.map((c) => (
              <button
                key={c.code}
                onClick={() => {
                  setCurrency(c.code);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors hover:bg-slate-50 dark:hover:bg-slate-800 ${selectedCurrency.code === c.code ? 'text-blue-600 dark:text-blue-400 font-bold bg-blue-50/50 dark:bg-blue-900/20' : 'text-slate-600 dark:text-slate-300'
                  }`}
              >
                <div className="flex flex-col items-start">
                  <span className="font-semibold">{c.name}</span>
                  <span className="text-[10px] opacity-70 uppercase tracking-wider">{c.code}</span>
                </div>
                <span className="font-bold">{c.symbol}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CurrencySwitcher;
