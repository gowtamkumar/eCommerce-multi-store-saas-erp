"use client";

import { fetchAPI } from "@/services/api";
import { useEffect, useState } from "react";
import ProductCard from "../../../product/components/ProductCard";
import { ProductSliderProps } from "../../type";



export default function ProductSlider({
  headline,
  source = 'all',
  productIds = [],
  count = 4,
  collectionId,
  layout = 'slider',
  columns = 4,
  mobileColumns = 1,
  styles
}: ProductSliderProps) {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProducts() {
      setLoading(true);
      try {
        let endpoint = `/products?limit=${source === 'manual' ? 100 : count}&status=active`;

        if (collectionId && source === 'collection') {
          endpoint += `&categoryId=${collectionId}`;
        }
        const res = await fetchAPI(endpoint);
        let fetchedProducts = res.data?.products || [];
        if (source === 'manual' && productIds.length > 0) {
          // Filter to only include products in productIds, maintaining the selection order
          fetchedProducts = productIds
            .map(id => fetchedProducts.find((p: any) => p.id === id))
            .filter(Boolean);
        }

        setProducts(fetchedProducts);
      } catch (error) {
        console.error("Failed to fetch products for slider:", error);
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, [count, collectionId, source, JSON.stringify(productIds)]);

  return (
    <div className="overflow-hidden">
      <div className="w-full">
        <div className={`flex items-center justify-between mb-8 md:mb-12
          ${styles?.textAlign === 'center' ? 'justify-center text-center' : ''}
          ${styles?.textAlign === 'right' ? 'justify-end text-right' : ''}
          ${!styles?.textAlign || styles?.textAlign === 'left' ? 'justify-start text-left' : ''}
        `}>
          <div className="space-y-1">
            <h2 className="text-2xl md:text-3xl font-black tracking-tight"
              style={{ color: styles?.headlineColor }}
            >{headline || 'Trending Products'}</h2>
            <div className={`h-1.5 bg-brand-500 rounded-full w-16
               ${styles?.textAlign === 'center' ? 'mx-auto' : ''}
               ${styles?.textAlign === 'right' ? 'ml-auto' : ''}
               ${!styles?.textAlign || styles?.textAlign === 'left' ? 'mr-auto' : ''}
            `} />
          </div>
        </div>

        {loading ? (
          <div className={layout === 'grid'
            ? `grid gap-6 md:gap-10 ${mobileColumns === 1 ? 'grid-cols-1' : 'grid-cols-2'} ${columns === 2 ? 'md:grid-cols-2' : columns === 3 ? 'md:grid-cols-3' : columns === 4 ? 'md:grid-cols-4' : 'md:grid-cols-1'}`
            : "flex gap-6 md:gap-10 overflow-x-hidden pb-8"
          }>
            {[...Array(count)].map((_, i) => (
              <div key={i} className={layout === 'grid' ? "" : "min-w-[280px] md:min-w-[320px] flex-1 animate-pulse"}>
                <div className="aspect-square bg-slate-200 dark:bg-slate-800 rounded-[2.5rem] mb-6" />
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2 mb-2" />
                <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-1/4" />
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className={layout === 'grid'
            ? `grid gap-6 md:gap-10 ${mobileColumns === 1 ? 'grid-cols-1' : 'grid-cols-2'} ${columns === 2 ? 'md:grid-cols-2' : columns === 3 ? 'md:grid-cols-3' : columns === 4 ? 'md:grid-cols-4' : 'md:grid-cols-1'}`
            : "flex gap-6 md:gap-10 overflow-x-auto pb-8 scrollbar-hide"
          }>
            {products.map((product) => (
              <div key={product.id} className={layout === 'grid' ? "h-full" : "min-w-[280px] md:min-w-[320px] flex-1 h-[450px]"}>
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center text-slate-400 border-4 border-dashed border-slate-100 dark:border-slate-800 rounded-[3rem]">
            {source === 'collection' && collectionId
              ? "No products found in this collection."
              : source === 'manual'
                ? "No products selected. Select products in the customizer settings."
                : "No products found. Add some products in the admin dashboard."}
          </div>
        )}
      </div>
    </div>
  );
}
