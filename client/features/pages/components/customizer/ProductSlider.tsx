"use client";

import { fetchAPI } from "@/services/api";
import { useEffect, useState } from "react";
import SectionHeader from "./SectionHeader";
import ProductCard from "../../../product/components/ProductCard";
import { ProductSliderProps } from "../../type";



export default function ProductSlider({
  sectionId,
  headline,
  source = 'all',
  productIds = [],
  count = 4,
  collectionId,
  layout = 'slider',
  columns = 4,
  mobileColumns = 2,
  styles
}: ProductSliderProps & { sectionId?: string }) {
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

  const cardRadiusClass = styles?.cardRadius === 'small' ? 'rounded-lg' :
    styles?.cardRadius === 'large' ? 'rounded-[2rem]' :
      styles?.cardRadius === 'none' ? 'rounded-none' : 'rounded-2xl';

  const gridColsClass = layout === 'grid'
    ? `grid gap-6`
    : "flex gap-6 overflow-x-auto pb-8 scrollbar-hide";

  const gridStyle: React.CSSProperties = layout === 'grid' ? {
    gridTemplateColumns: `repeat(${mobileColumns}, minmax(0, 1fr))`,
    '--md-cols': columns,
  } as any : {};

  return (
    <div className="w-full">
      <style>{`
        @media (min-width: 768px) {
          .product-grid-${sectionId || 'default'} {
            grid-template-columns: repeat(var(--md-cols, ${columns}), minmax(0, 1fr)) !important;
          }
        }
      `}</style>
      <div className="w-full">
        <SectionHeader title={headline} styles={styles} />

        {loading ? (
          <div
            className={`${gridColsClass} product-grid-${sectionId || 'default'}`}
            style={gridStyle}
          >
            {[...Array(count)].map((_, i) => (
              <div key={i} className={layout === 'grid' ? "w-full" : "min-w-[280px] md:min-w-[320px] flex-1 animate-pulse"}>
                <div className={`aspect-[4/5] bg-slate-200 dark:bg-slate-800 ${cardRadiusClass} mb-4`} />
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2 mb-2" />
                <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-1/4" />
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <div
            className={`${gridColsClass} product-grid-${sectionId || 'default'}`}
            style={gridStyle}
          >
            {products.map((product) => (
              <div key={product.id} className={layout === 'grid' ? "h-full" : "min-w-[280px] md:min-w-[320px] flex-1"}>
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        ) : (
          <div className={`py-20 text-center text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-800 ${cardRadiusClass}`}>
            <p className="max-w-xs mx-auto text-sm font-medium">
              {source === 'collection' && collectionId
                ? "No products found in this collection."
                : source === 'manual'
                  ? "No products selected. Select products in the customizer settings."
                  : "No products found. Add some products in the admin dashboard."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
