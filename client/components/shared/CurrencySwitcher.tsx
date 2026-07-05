'use client';

import { useSettings } from '@/hooks/SettingsContext';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, Globe } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const CurrencySwitcher = ({ variant = 'storefront' }: { variant?: 'storefront' | 'admin' }) => {
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

  // Helper to get a "flag" or indicator
  const getFlag = (code: string) => {
    switch (code) {
      case 'BDT': return '🇧🇩';
      case 'USD': return '🇺🇸';
      case 'EUR': return '🇪🇺';
      case 'GBP': return '🇬🇧';
      default: return '🌐';
    }
  };

  const isAdmin = variant === 'admin';
  const baseCurrencyCode = settings?.currency;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all border duration-300 group ${isOpen
            ? 'bg-brand-50 border-brand-200 dark:bg-brand-900/20 dark:border-brand-800 shadow-inner'
            : isAdmin
              ? 'bg-slate-50/80 dark:bg-slate-900/30 border-slate-200 dark:border-slate-700 hover:border-brand-300 dark:hover:border-brand-700 shadow-sm'
              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-brand-300 dark:hover:border-brand-700 shadow-sm'
          }`}
        title={isAdmin ? 'Convert displayed prices' : 'Select currency'}
      >
        <span className="text-lg leading-none">{getFlag(selectedCurrency.code)}</span>
        <div className="flex flex-col items-start leading-tight">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-brand-500 transition-colors">
            {isAdmin ? 'Display' : 'Currency'}
          </span>
          <span className="text-xs font-black text-slate-900 dark:text-white uppercase">{selectedCurrency.code}</span>
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 ml-1 ${isOpen ? 'rotate-180 text-brand-500' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className={`absolute right-0 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 py-3 z-[110] overflow-hidden ${isAdmin ? 'top-full mt-2' : 'bottom-full mb-2 md:bottom-auto md:top-full md:mt-2'}`}
          >
            <div className="px-4 py-2 mb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                {isAdmin ? 'Display Currency' : 'Select Region'}
              </span>
              {isAdmin && baseCurrencyCode && (
                <p className="text-[10px] text-slate-400 mt-1 normal-case tracking-normal font-medium">
                  Amounts stored in {baseCurrencyCode}, converted for display
                </p>
              )}
            </div>
            <div className="px-2 space-y-1 max-h-64 overflow-y-auto">
              {settings.supportedCurrencies.map((c, i) => (
                <motion.button
                  key={c.code}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => {
                    setCurrency(c.code);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${selectedCurrency.code === c.code
                      ? 'bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 font-bold'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                >
                  <span className="text-xl w-8 h-8 flex items-center justify-center bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700">
                    {getFlag(c.code)}
                  </span>
                  <div className="flex-1 flex flex-col items-start leading-tight">
                    <span className="text-xs font-bold">{c.name}</span>
                    <span className="text-[10px] opacity-60 uppercase tracking-tighter">
                      {c.code}{c.code === baseCurrencyCode ? ' · base' : ''}
                    </span>
                  </div>
                  {selectedCurrency.code === c.code && (
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-500 shadow-[0_0_8px_rgba(var(--brand-500-rgb),0.6)]" />
                  )}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CurrencySwitcher;
