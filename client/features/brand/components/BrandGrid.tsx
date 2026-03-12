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
    const updateWidth = () => {
      if (carouselRef.current) {
        setWidth(carouselRef.current.scrollWidth - carouselRef.current.offsetWidth);
      }
    };
    
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
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
    const radius = styles?.cardRadius ? (typeof styles.cardRadius === 'number' ? `${styles.cardRadius}px` : styles.cardRadius) : '1.5rem';
    
    // Card Border
    let border = 'none';
    if (styles?.cardBorder && styles?.cardBorder !== 'none') {
      const width = styles.cardBorder === 'thin' ? '1px' : styles.cardBorder === 'medium' ? '2px' : '4px';
      border = `${width} solid ${styles?.borderColor || 'rgba(0,0,0,0.1)'}`;
    }

    // Card Shadow
    let shadow = 'none';
    if (styles?.cardShadow && styles?.cardShadow !== 'none') {
      shadow = styles.cardShadow === 'large' ? '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)' :
               styles.cardShadow === 'medium' ? '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)' :
               '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)';
    }

    return {
      borderRadius: radius,
      border: border,
      boxShadow: shadow,
      backgroundColor: styles?.cardBackgroundColor || 'rgba(255, 255, 255, 0.02)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
    };
  };

  const cardStyles = getCardStyles();

  return (
    <div className="w-full">
      <div className="w-full">
        <div className="w-full">
          <SectionHeader title={title} styles={styles} />
          
          <div className={`mb-12 flex items-center justify-between
             ${styles?.textAlign === 'center' ? 'flex-col gap-6' : ''}
             ${styles?.textAlign === 'right' ? 'flex-row-reverse' : ''} 
          `}>
             <div className="flex-1" />
            {layout !== 'grid' && displayedBrands.length > 0 && (
              <div className="flex gap-3">
                <button
                  onClick={slideLeft}
                  className="w-10 h-10 md:w-12 md:h-12 rounded-xl border flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95"
                  style={{ 
                    borderColor: styles?.headlineColor || styles?.color || 'rgba(0,0,0,0.1)',
                    backgroundColor: 'transparent',
                    color: styles?.headlineColor || styles?.color || 'inherit'
                  }}
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={slideRight}
                  className="w-10 h-10 md:w-12 md:h-12 rounded-xl border flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95"
                  style={{ 
                    borderColor: styles?.headlineColor || styles?.color || 'rgba(0,0,0,0.1)',
                    backgroundColor: styles?.headlineColor || 'black',
                    color: '#fff'
                  }}
                >
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          <style>{`
            .brand-carousel-item {
              width: calc(${100 / mobileColumns}% - ${(24 * (mobileColumns - 1)) / mobileColumns}px);
            }
            @media (min-width: 768px) {
              .brand-carousel-item {
                width: calc(${100 / columns}% - ${(24 * (columns - 1)) / columns}px);
              }
            }
          `}</style>

          {loading ? (
            <div className={layout === 'grid'
              ? `grid gap-6 ${getGridCols(mobileColumns)} ${getMdGridCols(columns)}`
              : "flex gap-6 overflow-hidden pb-4"}
            >
              {[...Array(count)].map((_, i) => (
                <div key={i} className={layout === 'grid'
                  ? `aspect-[3/2] bg-slate-200 dark:bg-slate-800 animate-pulse`
                  : `brand-carousel-item shrink-0 aspect-[3/2] bg-slate-200 dark:bg-slate-800 animate-pulse`
                } style={{ borderRadius: cardStyles.borderRadius }} />
              ))}
            </div>
          ) : displayedBrands.length > 0 ? (
            layout === 'grid' ? (
              <div className={`grid gap-6 ${getGridCols(mobileColumns)} ${getMdGridCols(columns)}`}>
                {displayedBrands.map((brand) => (
                  <Link
                    key={brand.id}
                    href={`/products?brandId=${brand.id}`}
                    className="relative aspect-[3/2] flex flex-col items-center justify-center group overflow-hidden transition-all duration-500 hover:border-brand-500"
                    style={cardStyles}
                  >
                    {brand.image ? (
                      <img src={brand.image} alt={brand.name} className="w-full h-full object-contain p-6 md:p-10 transition-transform duration-700 group-hover:scale-110" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
                        <span className="text-4xl md:text-5xl mb-2 opacity-20 group-hover:opacity-100 transition-opacity">🏷️</span>
                        <span className="text-lg font-black text-slate-400 group-hover:text-slate-200 transition-colors uppercase tracking-tight line-clamp-1">{brand.name}</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-brand-600/0 group-hover:bg-brand-600/[0.03] transition-colors duration-500" />
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
                    <motion.div key={brand.id} className="brand-carousel-item shrink-0">
                      <Link
                        href={`/products?brandId=${brand.id}`}
                        draggable={false}
                        className="block relative aspect-[3/2] flex flex-col items-center justify-center group overflow-hidden transition-all duration-500 hover:border-brand-500 pointer-events-auto select-none"
                        style={cardStyles}
                      >
                        {brand.image ? (
                          <img src={brand.image} alt={brand.name} draggable={false} className="w-full h-full object-contain p-6 md:p-10 transition-transform duration-700 group-hover:scale-110" />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
                            <span className="text-4xl md:text-5xl mb-2 opacity-20 group-hover:opacity-100 transition-opacity">🏷️</span>
                            <span className="text-lg font-black text-slate-400 group-hover:text-slate-200 transition-colors uppercase tracking-tight line-clamp-1">{brand.name}</span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-brand-600/0 group-hover:bg-brand-600/[0.03] transition-colors duration-500" />
                      </Link>
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>
            )
          ) : (
            <div className={`col-span-full py-20 text-center text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-800`} style={{ borderRadius: cardStyles.borderRadius }}>
              No brands available.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
