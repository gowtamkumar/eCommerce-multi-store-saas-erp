'use client';

import Pagination from '@/components/shared/Pagination';
import Price from '@/components/shared/Price';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUpDown, Filter, Grid, List as ListIcon, Search, ShoppingBag, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  discountAmount: number;
  images: string[];
  description: string;
  stock: number;
  tagline?: string;
  status: string;
  category?: { name: string };
  shortDescription?: string;
}

interface ProductListProps {
  products: Product[];
  total: number;
  onOpenMobileFilters: () => void;
}

export default function ProductList({ products, total, onOpenMobileFilters }: ProductListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Sync local search state with URL
  useEffect(() => {
    setSearchQuery(searchParams.get('search') || '');
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (searchQuery.trim()) {
      params.set('search', searchQuery);
    } else {
      params.delete('search');
    }
    // Reset page on search
    params.delete('page');
    router.push(`/products?${params.toString()}`);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('sort', e.target.value);
    router.push(`/products?${params.toString()}`);
  };

  const currentSort = searchParams.get('sort') || 'newest';

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl p-4 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 md:sticky md:top-32 z-30 transition-all">
        {/* Mobile Filter Toggle */}
        <button
          onClick={onOpenMobileFilters}
          className="md:hidden w-full flex items-center justify-center gap-2 py-3 bg-brand-50 dark:bg-brand-900/20 rounded-2xl font-bold text-brand-600 dark:text-brand-400 border border-brand-100 dark:border-brand-900/30 active:scale-[0.98] transition-all"
        >
          <Filter className="w-5 h-5" />
          More Filters
        </button>

        {/* Search */}
        <form onSubmit={handleSearch} className="relative w-full md:w-80 lg:w-96 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-brand-500 transition-colors pointer-events-none" />
          <input
            type="text"
            placeholder="Search products..."
            className="w-full pl-11 pr-11 py-2.5 bg-slate-50 dark:bg-slate-900/50 border-2 border-slate-100 dark:border-slate-800 rounded-2xl focus:ring-0 focus:border-brand-500/50 outline-none transition-all font-medium text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                const params = new URLSearchParams(searchParams.toString());
                params.delete('search');
                router.push(`/products?${params.toString()}`);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-all"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </form>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex-1 md:flex-none flex items-center gap-2 bg-slate-50 dark:bg-slate-900/50 border-2 border-slate-100 dark:border-slate-800 rounded-2xl px-4 py-2.5 group focus-within:border-brand-500/50 transition-all">
            <ArrowUpDown className="w-4 h-4 text-slate-400 group-focus-within:text-brand-500 transition-colors" />
            <select
              className="bg-transparent outline-none text-sm font-bold w-full md:w-auto cursor-pointer appearance-none pr-2"
              value={currentSort}
              onChange={handleSortChange}
            >
              <option value="newest">Newest Arrivals</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="name-asc">Name: A to Z</option>
              <option value="name-desc">Name: Z to A</option>
            </select>
          </div>

          <div className="hidden sm:flex items-center gap-1 bg-slate-100/50 dark:bg-slate-900/50 rounded-2xl p-1.5 border border-slate-100 dark:border-slate-800">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-slate-800 shadow-md text-brand-600' : 'text-slate-400 hover:text-slate-600'}`}
              title="Grid View"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-xl transition-all ${viewMode === 'list' ? 'bg-white dark:bg-slate-800 shadow-md text-brand-600' : 'text-slate-400 hover:text-slate-600'}`}
              title="List View"
            >
              <ListIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between text-sm text-slate-500 px-1">
        <span>Showing <strong>{products.length}</strong> of <strong>{total}</strong> products</span>
      </div>

      {/* Product Grid/List */}
      {products.length > 0 ? (
        <div className={viewMode === 'grid'
          ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          : "space-y-4"
        }>
          <AnimatePresence mode="popLayout">
            {products.map((product) => (
              <motion.div
                layout
                key={product.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <Link
                  href={`/products/${product.slug}`}
                  className={`group bg-white dark:bg-slate-800/50 rounded-3xl overflow-hidden shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] border border-slate-100 dark:border-slate-800 hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.15)] hover:-translate-y-2 transition-all duration-500 flex ${viewMode === 'list' ? 'flex-row h-52' : 'flex-col h-full'}`}
                >
                  <div className={`relative overflow-hidden bg-slate-50 dark:bg-slate-900/80 ${viewMode === 'list' ? 'w-52 h-full shrink-0' : 'aspect-[4/5] w-full'}`}>
                    {product.images?.[0] ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700 ease-out"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300">
                        <ShoppingBag className="w-10 h-10 opacity-20" />
                      </div>
                    )}

                    {/* Badges */}
                    {(() => {
                      const discountAmt = Number(product.discountAmount || 0);
                      const basePrice = Number(product.price || 0);
                      const discountPct = discountAmt > 0 ? Math.round((discountAmt / basePrice) * 100) : 0;
                      return (
                        <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                          {product.stock <= 0 && (
                            <span className="bg-slate-900/90 backdrop-blur-md text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-lg">
                              Sold Out
                            </span>
                          )}
                          {discountAmt > 0 && (
                            <span className="bg-rose-500/90 backdrop-blur-md text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-lg">
                              {discountPct}% OFF
                            </span>
                          )}
                          {(product as any).applicablePromotions?.filter((p: any) => p.isActive).length > 0 && (
                            <span className="bg-brand-600/90 backdrop-blur-md text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-lg">
                              {(product as any).applicablePromotions.filter((p: any) => p.isActive)[0].name}
                            </span>
                          )}
                        </div>
                      );
                    })()}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </div>

                  <div className="p-6 flex flex-col justify-between flex-1 relative bg-white dark:bg-transparent">
                    <div>
                      <div className="flex items-center justify-between mb-3 text-[10px] font-black text-brand-600 dark:text-brand-400 uppercase tracking-widest">
                        {product.category?.name || "Premium Product"}
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 leading-snug group-hover:text-brand-600 transition-colors duration-300 line-clamp-2">
                        {product.name}
                      </h3>
                      <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed line-clamp-2 mb-4">
                        {product.shortDescription || product.description?.replace(/<[^>]*>?/gm, '')}
                      </p>
                    </div>

                    {(() => {
                      const discountAmt = Number(product.discountAmount || 0);
                      const basePrice = Number(product.price || 0);
                      return (
                        <div className="flex items-center justify-between pt-5 border-t border-slate-50 dark:border-slate-800 mt-auto">
                          <Price
                            amount={discountAmt > 0 ? basePrice - discountAmt : basePrice}
                            className="text-xl font-black text-slate-900 dark:text-white"
                            showOriginal={discountAmt > 0}
                            originalAmount={basePrice}
                          />
                          <div className="flex items-center gap-2 text-brand-600 font-bold text-xs group/btn">
                            <span className="hidden sm:inline">Details</span>
                            <div className="w-8 h-8 rounded-full bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center group-hover/btn:bg-brand-600 group-hover/btn:text-white transition-all">
                              <ArrowUpDown className="w-3 h-3 rotate-90" />
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 bg-white/50 dark:bg-slate-800/20 rounded-[3rem] border-2 border-dashed border-slate-100 dark:border-slate-800 p-8 text-center backdrop-blur-sm">
          <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-8 relative">
            <Search className="w-10 h-10 text-slate-300" />
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-rose-500 rounded-full border-4 border-white dark:border-slate-900 flex items-center justify-center">
              <X className="w-3 h-3 text-white" />
            </div>
          </div>
          <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-3">No Results Found</h3>
          <p className="text-slate-500 dark:text-slate-400 max-w-sm mb-10 font-medium">
            We couldn't find any products matching your current filters. Try broadening your search or resetting all filters.
          </p>
          <button
            onClick={() => {
              // Clear all filters
              router.push(`/products`);
            }}
            className="px-10 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-2xl hover:shadow-2xl hover:scale-105 active:scale-[0.98] transition-all"
          >
            Clear All Filters
          </button>
        </div>
      )}
      {/* Pagination */}
      <Pagination
        currentPage={parseInt(searchParams.get('page') || '1')}
        totalPages={Math.ceil(total / 20)} // Assuming 20 is the limit
        baseUrl="/products"
      />
    </div>
  );
}
