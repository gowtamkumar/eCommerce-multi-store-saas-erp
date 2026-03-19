"use client";

import { fetchAPI } from "@/services/api";
import { animate, motion, useMotionValue } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState, useMemo } from "react";
import SectionHeader from "@/features/admin/pages/components/customizer/SectionHeader";

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

  const uid = useMemo(() => `bg-${Math.random().toString(36).slice(2, 7)}`, []);

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

  let displayedBrands: any[] = [];
  if (source === 'manual' && items.length > 0) {
    const selectedIds = items.map(item => item.link).filter(Boolean);
    displayedBrands = selectedIds
      .map(id => brands.find(b => b.id === id))
      .filter(Boolean);
  } else {
    displayedBrands = brands.slice(0, count);
  }

  useEffect(() => {
    const updateWidth = () => {
      if (carouselRef.current) {
        setWidth(carouselRef.current.scrollWidth - carouselRef.current.offsetWidth);
      }
    };
    updateWidth();
    const timer = setTimeout(updateWidth, 100);
    window.addEventListener('resize', updateWidth);
    return () => {
      window.removeEventListener('resize', updateWidth);
      clearTimeout(timer);
    };
  }, [displayedBrands, loading, layout, columns, mobileColumns]);

  const slideLeft = () => {
    const current = x.get();
    const newPos = Math.min(current + (carouselRef.current?.offsetWidth || 400), 0);
    animate(x, newPos, { type: "spring", stiffness: 300, damping: 30 });
  };

  const slideRight = () => {
    const current = x.get();
    const newPos = Math.max(current - (carouselRef.current?.offsetWidth || 400), -width);
    animate(x, newPos, { type: "spring", stiffness: 300, damping: 30 });
  };

  const getCardStyles = () => {
    const radius = styles?.cardRadius
      ? (typeof styles.cardRadius === 'number' ? `${styles.cardRadius}px` : styles.cardRadius)
      : '1.5rem';

    let border = 'none';
    if (styles?.cardBorder && styles?.cardBorder !== 'none') {
      const bw = styles.cardBorder === 'thin' ? '1px' : styles.cardBorder === 'medium' ? '2px' : '4px';
      border = `${bw} solid ${styles?.borderColor || 'rgba(0,0,0,0.1)'}`;
    }

    let shadow = 'none';
    if (styles?.cardShadow && styles?.cardShadow !== 'none') {
      shadow = styles.cardShadow === 'large'
        ? '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)'
        : styles.cardShadow === 'medium'
          ? '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)'
          : '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)';
    }

    return {
      borderRadius: radius,
      border,
      boxShadow: shadow,
      backgroundColor: styles?.cardBackgroundColor || 'rgba(255, 255, 255, 0.02)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
    };
  };

  const cardStyles = getCardStyles();
  const isSlider = layout !== 'grid';

  return (
    <div className={`w-full py-10 sm:py-16 ${uid}`}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8 sm:mb-10 lg:gap-10">
          <div className="flex-1 min-w-0">
            <SectionHeader
              title={title}
              styles={styles}
              noMargin
              noPadding
              className="!mb-0"
            />
          </div>

          {isSlider && displayedBrands.length > 0 && (
            <div className="flex gap-2 sm:gap-3 shrink-0">
              <button
                onClick={slideLeft}
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl border flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 group shadow-sm bg-white/10"
                style={{
                  borderColor: styles?.borderColor || 'rgba(0,0,0,0.1)',
                  color: styles?.headlineColor || styles?.color || 'inherit'
                }}
                aria-label="Slide left"
              >
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
              </button>
              <button
                onClick={slideRight}
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 group shadow-lg"
                style={{
                  backgroundColor: styles?.headlineColor || styles?.buttonColor || '#000',
                  color: '#fff'
                }}
                aria-label="Slide right"
              >
                <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          )}
        </div>

        <style>{`
          .${uid} .carousel-item {
            width: calc(${100 / mobileColumns}% - ${(16 * (mobileColumns - 1)) / mobileColumns}px);
          }
          @media (min-width: 640px) {
            .${uid} .carousel-item {
              width: calc(${100 / Math.max(mobileColumns, Math.ceil((mobileColumns + columns) / 2))}% - ${(20 * (Math.max(mobileColumns, Math.ceil((mobileColumns + columns) / 2)) - 1)) / Math.max(mobileColumns, Math.ceil((mobileColumns + columns) / 2))}px);
            }
          }
          @media (min-width: 768px) {
            .${uid} .carousel-item {
              width: calc(${100 / columns}% - ${(24 * (columns - 1)) / columns}px);
            }
          }
        `}</style>

        {loading ? (
          <div className={isSlider
            ? "flex gap-3 sm:gap-4 md:gap-6 overflow-hidden pb-2"
            : `grid gap-3 sm:gap-4 md:gap-6 ${getGridCols(mobileColumns)} ${getMdGridCols(columns)}`}
          >
            {[...Array(count)].map((_, i) => (
              <div
                key={i}
                className={isSlider
                  ? "carousel-item shrink-0 aspect-[3/2] bg-slate-200 dark:bg-slate-800 animate-pulse"
                  : `aspect-[3/2] bg-slate-200 dark:bg-slate-800 animate-pulse`}
                style={{ borderRadius: cardStyles.borderRadius }}
              />
            ))}
          </div>
        ) : displayedBrands.length > 0 ? (
          isSlider ? (
            <motion.div ref={carouselRef} className="cursor-grab active:cursor-grabbing overflow-hidden">
              <motion.div
                drag="x"
                dragConstraints={{ right: 0, left: -width }}
                dragElastic={0.1}
                whileTap={{ cursor: "grabbing" }}
                style={{ x }}
                className="flex gap-3 sm:gap-4 md:gap-6"
              >
                {displayedBrands.map((brand) => (
                  <motion.div key={brand.id} className="carousel-item shrink-0">
                    <Link
                      href={`/products?brandId=${brand.id}`}
                      draggable={false}
                      className="block relative aspect-[3/2] flex flex-col items-center justify-center group overflow-hidden transition-all duration-500 hover:border-brand-500 pointer-events-auto select-none"
                      style={cardStyles}
                    >
                      {brand.image ? (
                        <img
                          src={brand.image}
                          alt={brand.name}
                          draggable={false}
                          className="w-full h-full object-contain p-3 sm:p-5 md:p-8 transition-transform duration-700 group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center p-3 sm:p-5 text-center">
                          <span className="text-2xl sm:text-3xl md:text-5xl mb-1 opacity-20 group-hover:opacity-100 transition-opacity">🏷️</span>
                          <span className="text-xs sm:text-sm md:text-base font-black text-slate-400 group-hover:text-slate-200 transition-colors uppercase tracking-tight line-clamp-1">
                            {brand.name}
                          </span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-brand-600/0 group-hover:bg-brand-600/[0.03] transition-colors duration-500" />
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          ) : (
            <div className={`grid gap-3 sm:gap-4 md:gap-6 ${getGridCols(mobileColumns)} ${getMdGridCols(columns)}`}>
              {displayedBrands.map((brand) => (
                <Link
                  key={brand.id}
                  href={`/products?brandId=${brand.id}`}
                  className="relative aspect-[3/2] flex flex-col items-center justify-center group overflow-hidden transition-all duration-500 hover:border-brand-500"
                  style={cardStyles}
                >
                  {brand.image ? (
                    <img
                      src={brand.image}
                      alt={brand.name}
                      className="w-full h-full object-contain p-3 sm:p-5 md:p-8 transition-transform duration-700 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-3 sm:p-5 text-center">
                      <span className="text-2xl sm:text-3xl md:text-5xl mb-1 opacity-20 group-hover:opacity-100 transition-opacity">🏷️</span>
                      <span className="text-xs sm:text-sm md:text-base font-black text-slate-400 group-hover:text-slate-200 transition-colors uppercase tracking-tight line-clamp-1">
                        {brand.name}
                      </span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-brand-600/0 group-hover:bg-brand-600/[0.03] transition-colors duration-500" />
                </Link>
              ))}
            </div>
          )
        ) : (
          <div
            className="py-12 sm:py-20 text-center text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-800 text-sm"
            style={{ borderRadius: cardStyles.borderRadius }}
          >
            No brands available.
          </div>
        )}
      </div>
    </div>
  );
}
