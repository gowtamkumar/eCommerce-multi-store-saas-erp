'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, Filter, X } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ProductFiltersProps } from '../types';



export default function ProductFilters({ categories, brands, isMobileOpen, onCloseMobile, settings }: ProductFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State from URL
  const currentCategory = searchParams.get('categoryId') || '';
  const currentBrand = searchParams.get('brandId') || '';
  const currentMinPrice = searchParams.get('minPrice') || '';
  const currentMaxPrice = searchParams.get('maxPrice') || '';
  const currentSort = searchParams.get('sort') || '';

  // Local state for price inputs
  const [minPrice, setMinPrice] = useState(currentMinPrice);
  const [maxPrice, setMaxPrice] = useState(currentMaxPrice);
  const [isPriceExpanded, setIsPriceExpanded] = useState(true);
  const [isCategoryExpanded, setIsCategoryExpanded] = useState(true);
  const [isBrandExpanded, setIsBrandExpanded] = useState(true);

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

  const handleBrandClick = (brandId: string) => {
    const newValue = currentBrand === brandId ? null : brandId;
    updateFilters({ brandId: newValue });
    if (window.innerWidth < 768) onCloseMobile();
  };

  const clearFilters = () => {
    router.push('/products');
    if (window.innerWidth < 768) onCloseMobile();
  };

  const hasActiveFilters = currentCategory || currentBrand || currentMinPrice || currentMaxPrice;

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
        fixed inset-y-0 left-0 z-50 w-80 bg-white dark:bg-slate-900 shadow-2xl transform transition-all duration-300 ease-in-out 
        md:translate-x-0 md:sticky md:top-28 md:w-64 md:shadow-none md:block md:z-30
        border-r md:border border-slate-100 dark:border-slate-800 md:rounded-3xl
        ${isMobileOpen ? 'translate-x-0 opacity-100' : '-translate-x-full md:opacity-100'}
      `}>
        <div className="h-full md:h-auto max-h-[calc(100vh-10rem)] flex flex-col p-6 overflow-y-auto custom-scrollbar">
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
            {settings?.showCategories !== false && (
              <>
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
                        <div className="space-y-1">
                          <button
                            onClick={() => handleCategoryClick('')}
                            className={`w-full text-left px-4 py-2.5 rounded-xl text-sm transition-all duration-200 group flex items-center justify-between ${!currentCategory
                              ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 font-bold shadow-sm'
                              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'
                              }`}
                          >
                            All Categories
                            {!currentCategory && <div className="w-1.5 h-1.5 rounded-full bg-brand-500" />}
                          </button>
                          {categories.map((cat) => (
                            <button
                              key={cat.id}
                              onClick={() => handleCategoryClick(cat.id)}
                              className={`w-full text-left px-4 py-2.5 rounded-xl text-sm transition-all duration-200 group flex items-center justify-between ${currentCategory === cat.id
                                ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 font-bold shadow-sm'
                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'
                                }`}
                            >
                              {cat.name}
                              {currentCategory === cat.id && <div className="w-1.5 h-1.5 rounded-full bg-brand-500" />}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <div className="h-px bg-slate-200 dark:bg-slate-800" />
              </>
            )}

            {/* Brands */}
            {settings?.showBrands !== false && (
              <>
                <div>
                  <button
                    onClick={() => setIsBrandExpanded(!isBrandExpanded)}
                    className="flex items-center justify-between w-full mb-4 group"
                  >
                    <h3 className="font-bold text-slate-900 dark:text-white">Brands</h3>
                    <ChevronDown className={`w-4 h-4 transition-transform ${isBrandExpanded ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {isBrandExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="space-y-1">
                          <button
                            onClick={() => handleBrandClick('')}
                            className={`w-full text-left px-4 py-2.5 rounded-xl text-sm transition-all duration-200 group flex items-center justify-between ${!currentBrand
                              ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 font-bold shadow-sm'
                              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'
                              }`}
                          >
                            All Brands
                            {!currentBrand && <div className="w-1.5 h-1.5 rounded-full bg-brand-500" />}
                          </button>
                          {brands.map((brand) => (
                            <button
                              key={brand.id}
                              onClick={() => handleBrandClick(brand.id)}
                              className={`w-full text-left px-4 py-2.5 rounded-xl text-sm transition-all duration-200 group flex items-center justify-between ${currentBrand === brand.id
                                ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 font-bold shadow-sm'
                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'
                                }`}
                            >
                              {brand.name}
                              {currentBrand === brand.id && <div className="w-1.5 h-1.5 rounded-full bg-brand-500" />}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <div className="h-px bg-slate-200 dark:bg-slate-800" />
              </>
            )}

            {/* Price Filter */}
            {settings?.showPriceFilter !== false && (
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
                        <div className="flex items-center gap-2">
                          <div className="relative flex-1 group">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold group-focus-within:text-brand-500 transition-colors">$</span>
                            <input
                              type="number"
                              value={minPrice}
                              onChange={(e) => setMinPrice(e.target.value)}
                              className="w-full pl-7 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800 rounded-xl text-sm outline-none focus:border-brand-500/50 focus:bg-white dark:focus:bg-slate-900 transition-all font-medium"
                              placeholder="Min"
                            />
                          </div>
                          <div className="w-2 h-px bg-slate-200 dark:bg-slate-700" />
                          <div className="relative flex-1 group">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold group-focus-within:text-brand-500 transition-colors">$</span>
                            <input
                              type="number"
                              value={maxPrice}
                              onChange={(e) => setMaxPrice(e.target.value)}
                              className="w-full pl-7 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800 rounded-xl text-sm outline-none focus:border-brand-500/50 focus:bg-white dark:focus:bg-slate-900 transition-all font-medium"
                              placeholder="Max"
                            />
                          </div>
                        </div>
                        <button
                          onClick={applyPriceFilter}
                          className="w-full py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-sm font-bold hover:shadow-lg active:scale-[0.98] transition-all"
                        >
                          Apply Filter
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>

          {hasActiveFilters && (
            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={clearFilters}
                className="w-full py-3 bg-rose-50 dark:bg-rose-900/10 text-rose-600 dark:text-rose-400 rounded-2xl text-sm font-bold hover:bg-rose-100 dark:hover:bg-rose-900/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <X className="w-4 h-4" /> Clear All Filters
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
