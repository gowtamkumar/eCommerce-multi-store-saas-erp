'use client';

import Price from '@/components/Price';
import { useSettings } from '@/contexts/SettingsContext';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUpDown, Grid, List as ListIcon, Search, X } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

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
}

interface ProductListProps {
  initialProducts: Product[];
  total: number;
}

export default function ProductList({ initialProducts, total: initialTotal }: ProductListProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const { settings } = useSettings();

  // client-side filtering and sorting for better UX
  // in a real app with 1000s of products, this would be server-side
  const filteredProducts = products
    .filter(p =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return 0; // Default (newest - usually already sorted by server)
    });

  return (
    <div className="space-y-8">
      {/* Search and Filters Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search products..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2">
            <ArrowUpDown className="w-4 h-4 text-slate-400" />
            <select
              className="bg-transparent outline-none text-sm font-medium"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="newest">Sort: Newest</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="name">Name: A-Z</option>
            </select>
          </div>

          <div className="hidden sm:flex items-center gap-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-slate-800 shadow-sm text-brand-600' : 'text-slate-400'}`}
            >
              <Grid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white dark:bg-slate-800 shadow-sm text-brand-600' : 'text-slate-400'}`}
            >
              <ListIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Product Display */}
      {filteredProducts.length > 0 ? (
        <div className={viewMode === 'grid'
          ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
          : "space-y-4"
        }>
          <AnimatePresence mode="popLayout">
            {filteredProducts.map((product) => (
              <motion.div
                layout
                key={product.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                <Link
                  href={`/products/${product.slug}`}
                  className={`group bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-xl transition-all duration-300 flex ${viewMode === 'list' ? 'flex-row h-48' : 'flex-col'}`}
                >
                  <div className={`relative overflow-hidden bg-slate-100 dark:bg-slate-900 ${viewMode === 'list' ? 'w-48 h-full shrink-0' : 'aspect-square'}`}>
                    {product.images?.[0] ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">No Image</div>
                    )}
                    {product.stock <= 0 && (
                      <div className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                        Out of Stock
                      </div>
                    )}
                    {product.discountAmount > 0 && (
                      <div className="absolute top-3 right-3 bg-brand-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                        Sale
                      </div>
                    )}
                  </div>

                  <div className="p-5 flex flex-col justify-between flex-1">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 line-clamp-1 group-hover:text-brand-600 transition-colors">
                        {product.name}
                      </h3>
                      <p className="text-slate-500 dark:text-slate-400 text-xs line-clamp-2 mb-4">
                        {product.description?.replace(/<[^>]*>?/gm, '')}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-slate-700/50">
                      <Price
                        amount={product.price}
                        className="text-brand-600 dark:text-brand-400"
                        showOriginal={product.discountAmount > 0}
                        originalAmount={+product.price + +product.discountAmount}
                      />
                      <span className="text-[10px] font-bold text-brand-600 dark:text-brand-400 uppercase tracking-tight group-hover:translate-x-1 transition-transform">
                        Details &rarr;
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700">
          <div className="w-20 h-20 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-slate-300" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">No products found</h3>
          <p className="text-slate-500 dark:text-slate-400 mt-2">Try adjusting your search or filters</p>
          <button
            onClick={() => { setSearchQuery(''); setIsFilterOpen(false); }}
            className="mt-6 text-brand-600 font-bold hover:underline"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
}
