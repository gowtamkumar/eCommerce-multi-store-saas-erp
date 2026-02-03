"use client";

import { fetchAPI } from "@/lib/api";
import Link from "next/link";
import { useEffect, useState } from "react";

interface BrandGridProps {
  title?: string;
  count?: number;
  source?: 'all' | 'manual';
  items?: any[];
  columns?: number;
  styles?: any;
}

export default function BrandGrid({
  title,
  count = 6,
  source = 'all',
  items = [],
  columns = 3,
  styles
}: BrandGridProps) {
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBrands() {
      setLoading(true);
      try {
        const res = await fetchAPI('/brands');
        setBrands(Array.isArray(res.data) ? res.data : []);
      } catch (error) {
        console.error("Failed to fetch brands:", error);
      } finally {
        setLoading(false);
      }
    }

    loadBrands();
  }, []);

  // Determine which brands to display
  let displayedBrands = [];
  if (source === 'manual' && items.length > 0) {
    const selectedIds = items.map(item => item.link).filter(Boolean);
    displayedBrands = selectedIds
      .map(id => brands.find(b => b.id === id))
      .filter(Boolean);
  } else {
    displayedBrands = brands.slice(0, count);
  }

  return (
    <section
      style={{
        ...styles,
        paddingTop: styles?.paddingTop,
        paddingBottom: styles?.paddingBottom,
        backgroundColor: styles?.backgroundColor,
        color: styles?.color
      }}
      className={`px-4 md:px-10 ${!styles?.paddingTop && !styles?.paddingBottom ? 'py-16 md:py-24' : ''}`}
    >
      <div className="max-w-7xl mx-auto">
        <div className={`mb-16 space-y-4
          ${styles?.textAlign === 'center' ? 'text-center' : ''}
          ${styles?.textAlign === 'right' ? 'text-right' : ''}
          ${!styles?.textAlign || styles?.textAlign === 'left' ? 'text-left' : ''}
        `}>
          <h2
            className="text-4xl md:text-5xl font-black tracking-tighter uppercase"
            style={{ color: styles?.headlineColor || styles?.color }}
          >
            {title || 'Our Brands'}
          </h2>
          <div
            className={`w-24 h-1.5 rounded-full
              ${styles?.textAlign === 'center' ? 'mx-auto' : ''}
              ${styles?.textAlign === 'right' ? 'ml-auto' : ''}
              ${!styles?.textAlign || styles?.textAlign === 'left' ? 'mr-auto' : ''}
            `}
            style={{ backgroundColor: styles?.sublineColor || styles?.headlineColor || styles?.color || '#4f46e5' }}
          />
        </div>

        {loading ? (
          <div className={`grid gap-8 grid-cols-1 sm:grid-cols-2 ${columns === 2 ? 'md:grid-cols-2' : columns === 4 ? 'md:grid-cols-4' : 'md:grid-cols-3'}`}>
            {[...Array(count)].map((_, i) => (
              <div key={i} className="aspect-[3/2] bg-slate-200 dark:bg-slate-800 rounded-3xl animate-pulse" />
            ))}
          </div>
        ) : displayedBrands.length > 0 ? (
          <div className={`grid gap-8 grid-cols-1 sm:grid-cols-2 ${columns === 2 ? 'md:grid-cols-2' : columns === 4 ? 'md:grid-cols-4' : 'md:grid-cols-3'}`}>
            {displayedBrands.map((brand) => (
              <Link
                key={brand.id}
                href={`/products?brandId=${brand.id}`}
                className="relative aspect-[3/2] rounded-3xl bg-white dark:bg-slate-800 flex flex-col items-center justify-center group overflow-hidden border border-slate-200 dark:border-slate-700 transition-all hover:border-brand-500 hover:shadow-xl dark:hover:shadow-brand-500/10"
              >
                {brand.image ? (
                  <img src={brand.image} alt={brand.name} className="w-full h-full object-contain p-8 transition-transform duration-500 group-hover:scale-110" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
                    <span className="text-4xl mb-2 opacity-30 group-hover:opacity-100 transition-opacity">🏷️</span>
                    <span className="text-xl font-bold text-slate-400 group-hover:text-slate-200 transition-colors uppercase tracking-tight">{brand.name}</span>
                  </div>
                )}

                <div className="absolute inset-0 bg-brand-600/0 group-hover:bg-brand-600/5 transition-colors duration-500" />
              </Link>
            ))}
          </div>
        ) : (
          <div className="col-span-full py-16 text-center text-slate-400 border-4 border-dashed border-slate-100 dark:border-slate-800 rounded-3xl">
            No brands available. Add brands in the admin dashboard.
          </div>
        )}
      </div>
    </section>
  );
}
