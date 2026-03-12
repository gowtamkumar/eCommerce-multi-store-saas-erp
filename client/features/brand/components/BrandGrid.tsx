"use client";

import SectionHeader from "@/features/pages/components/customizer/SectionHeader";
import { fetchAPI } from "@/services/api";
import { animate, motion, useMotionValue } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

interface BrandGridProps {
  sectionId?: string;
  title?: string;
  count?: number;
  source?: 'all' | 'manual';
  items?: any[];
  columns?: number;
  mobileColumns?: number;
  styles?: any;
  layout?: 'grid' | 'slider';
}

export default function BrandGrid({
  sectionId,
  title,
  count = 6,
  source = 'all',
  items = [],
  columns = 3,
  mobileColumns = 2,
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

  const getGridCols = (cols: number) => {
    switch (cols) {
      case 1: return 'grid-cols-1';
      case 2: return 'grid-cols-2';
      case 3: return 'grid-cols-3';
      case 4: return 'grid-cols-4';
      case 5: return 'grid-cols-5';
      case 6: return 'grid-cols-6';
      default: return 'grid-cols-3';
    }
  };

  const getMdGridCols = (cols: number) => {
    switch (cols) {
      case 1: return 'md:grid-cols-1';
      case 2: return 'md:grid-cols-2';
      case 3: return 'md:grid-cols-3';
      case 4: return 'md:grid-cols-4';
      case 5: return 'md:grid-cols-5';
      case 6: return 'md:grid-cols-6';
      default: return 'md:grid-cols-3';
    }
  };

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

  const cardRadiusClass = styles?.cardRadius === 'small' ? 'rounded-lg' :
    styles?.cardRadius === 'large' ? 'rounded-[2rem]' :
      styles?.cardRadius === 'full' ? 'rounded-full' :
        styles?.cardRadius === 'none' ? 'rounded-none' : 'rounded-3xl';


  return (
    <div className="w-full">
      <div className="w-full">
        <div className="w-full">
          <SectionHeader title={title} styles={styles} />
          <div className={`mb-12 flex justify-end items-end
            ${styles?.textAlign === 'center' ? 'justify-center' : ''}
            ${styles?.textAlign === 'right' ? 'justify-start' : ''} 
          `}>
            {layout !== 'grid' && displayedBrands.length > 0 && (
              <div className="flex gap-3">
                <button
                  onClick={slideLeft}
                  className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-white dark:hover:text-black transition-all"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={slideRight}
                  className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-white dark:hover:text-black transition-all"
                >
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          {loading ? (
            <div className={layout === 'grid'
              ? `grid gap-6 ${getGridCols(mobileColumns)} ${getMdGridCols(columns)}`
              : "flex gap-6 overflow-hidden pb-4"}
            >
              {[...Array(count)].map((_, i) => (
                <div key={i} className={layout === 'grid'
                  ? `aspect-[3/2] bg-slate-200 dark:bg-slate-800 ${cardRadiusClass} animate-pulse`
                  : `min-w-[200px] md:min-w-[240px] aspect-[3/2] bg-slate-200 dark:bg-slate-800 ${cardRadiusClass} animate-pulse`
                } />
              ))}
            </div>
          ) : displayedBrands.length > 0 ? (
            layout === 'grid' ? (
              <div className={`grid gap-6 ${getGridCols(mobileColumns)} ${getMdGridCols(columns)}`}>
                {displayedBrands.map((brand) => (
                  <Link
                    key={brand.id}
                    href={`/products?brandId=${brand.id}`}
                    className={`relative aspect-[3/2] ${cardRadiusClass} bg-white dark:bg-slate-800 flex flex-col items-center justify-center group overflow-hidden border border-slate-200 dark:border-slate-700 transition-all hover:border-brand-500 hover:shadow-xl dark:hover:shadow-brand-500/10`}
                  >
                    {brand.image ? (
                      <img src={brand.image} alt={brand.name} className="w-full h-full object-contain p-6 md:p-8 transition-transform duration-500 group-hover:scale-110" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
                        <span className="text-3xl md:text-4xl mb-2 opacity-30 group-hover:opacity-100 transition-opacity">🏷️</span>
                        <span className="text-lg md:text-xl font-bold text-slate-400 group-hover:text-slate-200 transition-colors uppercase tracking-tight line-clamp-1">{brand.name}</span>
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
                  className="flex gap-6"
                >
                  {displayedBrands.map((brand) => (
                    <motion.div key={brand.id} className="min-w-[200px] md:min-w-[280px] shrink-0">
                      <Link
                        href={`/products?brandId=${brand.id}`}
                        draggable={false}
                        className={`block relative aspect-[3/2] ${cardRadiusClass} bg-white dark:bg-slate-800 flex flex-col items-center justify-center group overflow-hidden border border-slate-200 dark:border-slate-700 transition-all hover:border-brand-500 hover:shadow-xl dark:hover:shadow-brand-500/10 pointer-events-auto select-none`}
                      >
                        {brand.image ? (
                          <img src={brand.image} alt={brand.name} draggable={false} className="w-full h-full object-contain p-6 md:p-8 transition-transform duration-500 group-hover:scale-110" />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
                            <span className="text-3xl md:text-4xl mb-2 opacity-30 group-hover:opacity-100 transition-opacity">🏷️</span>
                            <span className="text-lg md:text-xl font-bold text-slate-400 group-hover:text-slate-200 transition-colors uppercase tracking-tight line-clamp-1">{brand.name}</span>
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
            <div className={`col-span-full py-16 text-center text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-800 ${cardRadiusClass}`}>
              No brands available.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
