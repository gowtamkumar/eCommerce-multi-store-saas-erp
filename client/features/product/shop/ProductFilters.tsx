'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, Filter, X } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ProductFiltersProps } from '@/features/product/types';



export default function ProductFilters({ categories, brands, filterOptions, isMobileOpen, onCloseMobile, settings }: ProductFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State from URL
  const currentCategory = searchParams.get('categoryId') || '';
  const currentBrand = searchParams.get('brandId') || '';
  const currentMinPrice = searchParams.get('minPrice') || '';
  const currentMaxPrice = searchParams.get('maxPrice') || '';
  const currentSort = searchParams.get('sort') || '';
  const currentAttributes: Record<string, string[]> = JSON.parse(searchParams.get('attributes') || '{}');

  // Local state for price inputs
  const [minPrice, setMinPrice] = useState(currentMinPrice);
  const [maxPrice, setMaxPrice] = useState(currentMaxPrice);

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    category: true,
    brand: true,
    price: true,
    ...(filterOptions?.attributes?.reduce((acc: any, attr: any) => ({ ...acc, [attr.name]: true }), {}) || {})
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

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

  const handleAttributeClick = (name: string, value: string) => {
    const newAttributes = { ...currentAttributes };
    if (!newAttributes[name]) {
      newAttributes[name] = [value];
    } else if (newAttributes[name].includes(value)) {
      newAttributes[name] = newAttributes[name].filter(v => v !== value);
      if (newAttributes[name].length === 0) delete newAttributes[name];
    } else {
      newAttributes[name] = [...newAttributes[name], value];
    }

    updateFilters({
      attributes: Object.keys(newAttributes).length > 0 ? JSON.stringify(newAttributes) : null
    });
  };

  const clearFilters = () => {
    router.push('/products');
    if (window.innerWidth < 768) onCloseMobile();
  };

  const hasActiveFilters = currentCategory || currentBrand || currentMinPrice || currentMaxPrice || Object.keys(currentAttributes).length > 0;

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
              <div className="mb-8">
                <button
                  onClick={() => toggleSection('category')}
                  className="flex items-center justify-between w-full mb-4 group"
                >
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 group-hover:text-brand-600 transition-colors">Categories</h3>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${expandedSections.category ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {expandedSections.category && (
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
            )}

            {/* Brands */}
            {settings?.showBrands !== false && (
              <div className="mb-8">
                <button
                  onClick={() => toggleSection('brand')}
                  className="flex items-center justify-between w-full mb-4 group"
                >
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 group-hover:text-brand-600 transition-colors">Brands</h3>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${expandedSections.brand ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {expandedSections.brand && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="space-y-2 overflow-hidden"
                    >
                      <button
                        onClick={() => handleBrandClick('')}
                        className={`
                          flex items-center w-full px-3 py-2 rounded-xl text-sm transition-all duration-200
                          ${!currentBrand
                            ? 'bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 font-medium'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'}
                        `}
                      >
                        <div className={`
                          w-4 h-4 rounded border mr-3 flex items-center justify-center transition-colors
                          ${!currentBrand ? 'bg-brand-600 border-brand-600' : 'border-slate-300 dark:border-slate-600'}
                        `}>
                          {!currentBrand && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                        All Brands
                      </button>
                      {brands.map((brand) => (
                        <button
                          key={brand.id}
                          onClick={() => handleBrandClick(brand.id)}
                          className={`
                            flex items-center w-full px-3 py-2 rounded-xl text-sm transition-all duration-200
                            ${currentBrand === brand.id
                              ? 'bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 font-medium'
                              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'}
                          `}
                        >
                          <div className={`
                            w-4 h-4 rounded border mr-3 flex items-center justify-center transition-colors
                            ${currentBrand === brand.id ? 'bg-brand-600 border-brand-600' : 'border-slate-300 dark:border-slate-600'}
                          `}>
                            {currentBrand === brand.id && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </div>
                          {brand.name}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Dynamic Attributes */}
            {filterOptions?.attributes?.map((attr: any) => (
              <div key={attr.name} className="mb-8">
                <button
                  onClick={() => toggleSection(attr.name)}
                  className="flex items-center justify-between w-full mb-4 group"
                >
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 group-hover:text-brand-600 transition-colors">
                    {attr.name}
                  </h3>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${expandedSections[attr.name] ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {expandedSections[attr.name] && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="space-y-2 overflow-hidden"
                    >
                      {attr.values.map((val: string) => {
                        const isActive = currentAttributes[attr.name]?.includes(val);
                        return (
                          <button
                            key={val}
                            onClick={() => handleAttributeClick(attr.name, val)}
                            className={`
                              flex items-center w-full px-3 py-2 rounded-xl text-sm transition-all duration-200
                              ${isActive
                                ? 'bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 font-medium'
                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'}
                            `}
                          >
                            <div className={`
                              w-4 h-4 rounded border mr-3 flex items-center justify-center transition-colors
                              ${isActive ? 'bg-brand-600 border-brand-600' : 'border-slate-300 dark:border-slate-600'}
                            `}>
                              {isActive && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                            </div>
                            {val}
                          </button>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}

            {/* Price Range */}
            {settings?.showPriceFilter !== false && (
              <div className="mb-0">
                <button
                  onClick={() => toggleSection('price')}
                  className="flex items-center justify-between w-full mb-4 group"
                >
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 group-hover:text-brand-600 transition-colors">Price Range</h3>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${expandedSections.price ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {expandedSections.price && (
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
