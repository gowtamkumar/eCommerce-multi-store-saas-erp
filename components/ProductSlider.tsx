"use client";

import { fetchAPI } from "@/lib/api";
import { Plus } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import Price from "./Price";

interface ProductSliderProps {
  headline?: string;
  count?: number;
  collectionId?: string; // This is the category slug/id
  styles?: any;
}

export default function ProductSlider({ headline, count = 4, collectionId, styles }: ProductSliderProps) {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProducts() {
      setLoading(true);
      try {
        let endpoint = `/products?limit=${count}&status=active`;
        if (collectionId) {
          endpoint += `&category=${collectionId}`;
        }
        const res = await fetchAPI(endpoint);
        setProducts(res.data?.products || []);
      } catch (error) {
        console.error("Failed to fetch products for slider:", error);
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, [count, collectionId]);

  return (
    <div style={styles} className="px-4 md:px-10 py-16 md:py-24 bg-slate-50 dark:bg-slate-900/40 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-10 md:mb-16">
          <div className="space-y-1">
            <h2 className="text-3xl md:text-4xl font-black tracking-tight">{headline || 'Trending Products'}</h2>
            <div className="w-20 h-1.5 bg-brand-500 rounded-full" />
          </div>
          <div className="hidden md:flex gap-3">
            <button className="w-14 h-14 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-white dark:hover:bg-slate-800 transition-all shadow-sm">←</button>
            <button className="w-14 h-14 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-white dark:hover:bg-slate-800 transition-all shadow-sm">→</button>
          </div>
        </div>

        {loading ? (
          <div className="flex gap-6 md:gap-10 overflow-x-hidden pb-8">
            {[...Array(count)].map((_, i) => (
              <div key={i} className="min-w-[280px] md:min-w-[320px] flex-1 animate-pulse">
                <div className="aspect-square bg-slate-200 dark:bg-slate-800 rounded-[2.5rem] mb-6" />
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2 mb-2" />
                <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-1/4" />
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="flex gap-6 md:gap-10 overflow-x-auto pb-8 scrollbar-hide">
            {products.map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.slug}`}
                className="min-w-[280px] md:min-w-[320px] flex-1 group cursor-pointer"
              >
                <div className="aspect-square bg-white dark:bg-slate-800 rounded-[2.5rem] mb-6 flex items-center justify-center border border-slate-100 dark:border-slate-700 shadow-sm group-hover:shadow-2xl transition-all duration-500 relative overflow-hidden">
                  {product.images?.[0] ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  ) : (
                    <span className="text-6xl transform group-hover:scale-110 transition-transform duration-700">📦</span>
                  )}
                  <div className="absolute bottom-6 right-6 bg-brand-600 text-white p-3 rounded-full opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 shadow-xl">
                    <Plus className="w-6 h-6" />
                  </div>
                </div>
                <div className="px-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                    {product.category?.name || 'Premium Item'}
                  </p>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1 group-hover:text-brand-600 transition-colors truncate">
                    {product.name}
                  </h3>
                  <div className="flex items-center gap-3">
                    <Price
                      amount={product.price}
                      className="text-2xl font-black text-brand-600"
                      showOriginal={product.discountAmount > 0}
                      originalAmount={+product.price + +product.discountAmount}
                    />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center text-slate-400 border-4 border-dashed border-slate-100 dark:border-slate-800 rounded-[3rem]">
            No products found in this collection.
          </div>
        )}
      </div>
    </div>
  );
}
