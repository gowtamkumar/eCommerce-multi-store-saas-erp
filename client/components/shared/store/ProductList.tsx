'use client';

import Pagination from '@/components/shared/Pagination';
import Price from '@/components/shared/Price';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUpDown, Filter, Grid, List as ListIcon, Search, X } from 'lucide-react';
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
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 sticky top-24 z-30 transition-all">
        {/* Mobile Filter Toggle */}
        <button
          onClick={onOpenMobileFilters}
          className="md:hidden w-full flex items-center justify-center gap-2 py-2.5 bg-slate-50 dark:bg-slate-900 rounded-xl font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
        >
          <Filter className="w-5 h-5" />
          Filter Products
        </button>

        {/* Search */}
        <form onSubmit={handleSearch} className="relative w-full md:w-80 lg:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search products..."
            className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition-all"
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
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </form>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex-1 md:flex-none flex items-center gap-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5">
            <ArrowUpDown className="w-4 h-4 text-slate-400" />
            <select
              className="bg-transparent outline-none text-sm font-medium w-full md:w-auto cursor-pointer"
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

          <div className="hidden sm:flex items-center gap-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-slate-800 shadow-sm text-brand-600' : 'text-slate-400'}`}
              title="Grid View"
            >
              <Grid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white dark:bg-slate-800 shadow-sm text-brand-600' : 'text-slate-400'}`}
              title="List View"
            >
              <ListIcon className="w-5 h-5" />
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
          ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
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
                  className={`group bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex ${viewMode === 'list' ? 'flex-row h-48' : 'flex-col h-full'}`}
                >
                  <div className={`relative overflow-hidden bg-slate-100 dark:bg-slate-900 ${viewMode === 'list' ? 'w-48 h-full shrink-0' : 'aspect-[4/5] w-full'}`}>
                    {product.images?.[0] ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">No Image</div>
                    )}

                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex flex-col gap-2">
                      {product.stock <= 0 && (
                        <span className="bg-red-500/90 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
                          Out of Stock
                        </span>
                      )}
                      {product.discountAmount > 0 && (
                        <span className="bg-brand-600/90 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
                          Sale
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-5 flex flex-col justify-between flex-1">
                    <div>
                      {product.category && (
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                          {product.category.name}
                        </p>
                      )}
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 leading-tight group-hover:text-brand-600 transition-colors">
                        {product.name}
                      </h3>
                      <p className="text-slate-500 dark:text-slate-400 text-xs line-clamp-2 mb-4">
                        {product.shortDescription || product.description?.replace(/<[^>]*>?/gm, '')}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-slate-700/50 mt-auto">
                      <Price
                        amount={product.price}
                        className="text-lg text-brand-600 dark:text-brand-400"
                        showOriginal={product.discountAmount > 0}
                        originalAmount={+product.price + +product.discountAmount}
                      />
                      <span className="text-xs font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-700 px-3 py-1.5 rounded-lg group-hover:bg-brand-600 group-hover:text-white transition-colors">
                        View Details
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-800 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700 p-8 text-center">
          <div className="w-20 h-20 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mb-6">
            <Search className="w-10 h-10 text-slate-300" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">No products found</h3>
          <p className="text-slate-500 dark:text-slate-400 max-w-sm mb-8">
            We couldn't find any products matching your filters. Try adjusting your search query or price range.
          </p>
          <button
            onClick={() => {
              // Clear all filters
              const params = new URLSearchParams();
              router.push(`/products`);
            }}
            className="px-8 py-3 bg-brand-600 text-white font-bold rounded-xl hover:bg-brand-700 transition-colors shadow-lg shadow-brand-500/25"
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
