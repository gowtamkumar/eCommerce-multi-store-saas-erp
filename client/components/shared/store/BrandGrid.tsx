"use client";

import { fetchAPI } from "@/services/api";
import { animate, motion, useMotionValue } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

interface BrandGridProps {
  title?: string;
  count?: number;
  source?: 'all' | 'manual';
  items?: any[];
  columns?: number;
  styles?: any;
  layout?: 'grid' | 'slider';
}

export default function BrandGrid({
  title,
  count = 6,
  source = 'all',
  items = [],
  columns = 3,
  styles,
  layout = 'slider'
}: BrandGridProps) {
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const carouselRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const x = useMotionValue(0);

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

  useEffect(() => {
    if (carouselRef.current) {
      setWidth(carouselRef.current.scrollWidth - carouselRef.current.offsetWidth);
    }
  }, [displayedBrands, loading, layout]);

  const slideLeft = () => {
    const current = x.get();
    const newPos = Math.min(current + 400, 0); // clamp to 0 (start)
    animate(x, newPos, { type: "spring", stiffness: 300, damping: 30 });
  };

  const slideRight = () => {
    const current = x.get();
    const newPos = Math.max(current - 400, -width); // clamp to -width (end)
    animate(x, newPos, { type: "spring", stiffness: 300, damping: 30 });
  };

  return (
    <section
      style={{
        ...styles,
        paddingTop: styles?.paddingTop,
        paddingBottom: styles?.paddingBottom,
        backgroundColor: styles?.backgroundColor,
        color: styles?.color
      }}
      className={`px-4 md:px-10 ${!styles?.paddingTop && !styles?.paddingBottom ? 'py-16 md:py-24' : ''} overflow-hidden`}
    >
      <div className="max-w-7xl mx-auto">
        <div className={`mb-16 flex justify-between items-end
          ${styles?.textAlign === 'center' ? 'flex-col items-center text-center gap-6' : ''}
          ${styles?.textAlign === 'right' ? 'flex-row-reverse text-right' : ''}
          ${!styles?.textAlign || styles?.textAlign === 'left' ? 'text-left' : ''}
        `}>
          <div className="space-y-4">
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

          {layout !== 'grid' && (
            <div className="flex gap-4">
              <button
                onClick={slideLeft}
                className="w-12 h-12 rounded-full border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-white dark:hover:text-black transition-all"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <button
                onClick={slideRight}
                className="w-12 h-12 rounded-full border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-white dark:hover:text-black transition-all"
              >
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        {loading ? (
          <div className={layout === 'grid'
            ? `grid gap-8 grid-cols-1 sm:grid-cols-2 ${columns === 2 ? 'md:grid-cols-2' : columns === 4 ? 'md:grid-cols-4' : 'md:grid-cols-3'}`
            : "flex gap-8 overflow-hidden pb-4"
          }>
            {[...Array(count)].map((_, i) => (
              <div key={i} className={layout === 'grid'
                ? "aspect-[3/2] bg-slate-200 dark:bg-slate-800 rounded-3xl animate-pulse"
                : "min-w-[200px] md:min-w-[240px] aspect-[3/2] bg-slate-200 dark:bg-slate-800 rounded-3xl animate-pulse"
              } />
            ))}
          </div>
        ) : displayedBrands.length > 0 ? (
          layout === 'grid' ? (
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
            <motion.div ref={carouselRef} className="cursor-grab active:cursor-grabbing overflow-hidden">
              <motion.div
                drag="x"
                dragConstraints={{ right: 0, left: -width }}
                whileTap={{ cursor: "grabbing" }}
                style={{ x }}
                className="flex gap-8"
              >
                {displayedBrands.map((brand) => (
                  <motion.div key={brand.id} className="min-w-[200px] md:min-w-[280px] shrink-0">
                    <Link
                      href={`/products?brandId=${brand.id}`}
                      draggable={false}
                      className="block relative aspect-[3/2] rounded-3xl bg-white dark:bg-slate-800 flex flex-col items-center justify-center group overflow-hidden border border-slate-200 dark:border-slate-700 transition-all hover:border-brand-500 hover:shadow-xl dark:hover:shadow-brand-500/10 pointer-events-auto select-none"
                    >
                      {brand.image ? (
                        <img src={brand.image} alt={brand.name} draggable={false} className="w-full h-full object-contain p-8 transition-transform duration-500 group-hover:scale-110" />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
                          <span className="text-4xl mb-2 opacity-30 group-hover:opacity-100 transition-opacity">🏷️</span>
                          <span className="text-xl font-bold text-slate-400 group-hover:text-slate-200 transition-colors uppercase tracking-tight">{brand.name}</span>
                        </div>
                      )}

                      <div className="absolute inset-0 bg-brand-600/0 group-hover:bg-brand-600/5 transition-colors duration-500" />
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          )
        ) : (
          <div className="col-span-full py-16 text-center text-slate-400 border-4 border-dashed border-slate-100 dark:border-slate-800 rounded-3xl">
            No brands available. Add brands in the admin dashboard.
          </div>
        )}
      </div>
    </section>
  );
}
