'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, Filter, X } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface ProductFiltersProps {
  categories: Category[];
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export default function ProductFilters({ categories, isMobileOpen, onCloseMobile }: ProductFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State from URL
  const currentCategory = searchParams.get('categoryId') || '';
  const currentMinPrice = searchParams.get('minPrice') || '';
  const currentMaxPrice = searchParams.get('maxPrice') || '';
  const currentSort = searchParams.get('sort') || '';

  // Local state for price inputs
  const [minPrice, setMinPrice] = useState(currentMinPrice);
  const [maxPrice, setMaxPrice] = useState(currentMaxPrice);
  const [isPriceExpanded, setIsPriceExpanded] = useState(true);
  const [isCategoryExpanded, setIsCategoryExpanded] = useState(true);

  // Sync state with URL changes
  useEffect(() => {
    setMinPrice(currentMinPrice);
    setMaxPrice(currentMaxPrice);
  }, [currentMinPrice, currentMaxPrice]);

  const updateFilters = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === '') {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    // Reset pagination when filtering
    params.delete('page');

    router.push(`/products?${params.toString()}`);
  };

  const applyPriceFilter = () => {
    updateFilters({
      minPrice: minPrice,
      maxPrice: maxPrice
    });
    if (window.innerWidth < 768) onCloseMobile();
  };

  const handleCategoryClick = (categoryId: string) => {
    // Toggle if clicking same
    const newValue = currentCategory === categoryId ? null : categoryId;
    updateFilters({ categoryId: newValue });
    if (window.innerWidth < 768) onCloseMobile();
  };

  const clearFilters = () => {
    router.push('/products');
    if (window.innerWidth < 768) onCloseMobile();
  };

  const hasActiveFilters = currentCategory || currentMinPrice || currentMaxPrice;

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Content */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-80 bg-white dark:bg-slate-900 shadow-2xl transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:w-64 md:shadow-none md:block border-r border-slate-100 dark:border-slate-800
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-full flex flex-col p-6 overflow-y-auto custom-scrollbar">
          <div className="flex items-center justify-between mb-8 md:hidden">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Filter className="w-5 h-5" /> Filters
            </h2>
            <button onClick={onCloseMobile} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-8">
            {/* Categories */}
            <div>
              <button
                onClick={() => setIsCategoryExpanded(!isCategoryExpanded)}
                className="flex items-center justify-between w-full mb-4 group"
              >
                <h3 className="font-bold text-slate-900 dark:text-white">Categories</h3>
                <ChevronDown className={`w-4 h-4 transition-transform ${isCategoryExpanded ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {isCategoryExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-2">
                      <button
                        onClick={() => handleCategoryClick('')}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${!currentCategory
                            ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-400 font-medium'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                          }`}
                      >
                        All Categories
                      </button>
                      {categories.map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => handleCategoryClick(cat.id)}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${currentCategory === cat.id
                              ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-400 font-medium'
                              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                            }`}
                        >
                          {cat.name}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="h-px bg-slate-200 dark:bg-slate-800" />

            {/* Price Filter */}
            <div>
              <button
                onClick={() => setIsPriceExpanded(!isPriceExpanded)}
                className="flex items-center justify-between w-full mb-4 group"
              >
                <h3 className="font-bold text-slate-900 dark:text-white">Price Range</h3>
                <ChevronDown className={`w-4 h-4 transition-transform ${isPriceExpanded ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {isPriceExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-4 px-1">
                      <div className="flex gap-4">
                        <div className="w-1/2">
                          <label className="text-xs text-slate-500 mb-1 block">Min</label>
                          <input
                            type="number"
                            value={minPrice}
                            onChange={(e) => setMinPrice(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none focus:border-brand-500 transition-colors"
                            placeholder="0"
                          />
                        </div>
                        <div className="w-1/2">
                          <label className="text-xs text-slate-500 mb-1 block">Max</label>
                          <input
                            type="number"
                            value={maxPrice}
                            onChange={(e) => setMaxPrice(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none focus:border-brand-500 transition-colors"
                            placeholder="Any"
                          />
                        </div>
                      </div>
                      <button
                        onClick={applyPriceFilter}
                        className="w-full py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
                      >
                        Apply Price
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {hasActiveFilters && (
            <div className="mt-auto pt-8">
              <button
                onClick={clearFilters}
                className="w-full py-3 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-400 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
