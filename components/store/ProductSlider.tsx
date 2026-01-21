"use client";

import { fetchAPI } from "@/lib/api";
import { useEffect, useState } from "react";
import ProductCard from "./ProductCard";

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
              <div key={product.id} className="min-w-[280px] md:min-w-[320px] flex-1 h-[450px]">
                <ProductCard product={product} />
              </div>
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
