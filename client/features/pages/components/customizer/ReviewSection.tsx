"use client";

import { fetchAPI } from "@/services/api";
import { ReviewItem } from "@/types/customizer";
import { animate, motion, useMotionValue } from "framer-motion";
import { ArrowLeft, ArrowRight, Star } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface ReviewSectionProps {
  settings: {
    title?: string;
    source?: 'manual' | 'all' | 'selection' | 'database';
    count?: number;
    reviews?: ReviewItem[];
    reviewIds?: string[];
    [key: string]: any;
  };
  styles?: any;
}

export default function ReviewSection({ settings, styles }: ReviewSectionProps) {
  const [displayReviews, setDisplayReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const x = useMotionValue(0);

  useEffect(() => {
    async function loadData() {
      if (settings.source === 'database' || settings.source === 'all' || settings.source === 'selection') {
        setLoading(true);
        try {
          const data = await fetchAPI('/reviews/public');
          if (data.data) {
            let mapped = data.data.map((r: any) => ({
              id: r.id || r._id,
              author: r.customerName,
              text: r.comment,
              rating: r.rating,
              avatar: r.avatar
            }));

            if (settings.source === 'selection' && settings.reviewIds && settings.reviewIds.length > 0) {
              // Filter by selected IDs
              mapped = settings.reviewIds
                .map((id: string) => mapped.find((r: any) => r.id === id))
                .filter(Boolean);
            } else {
              // Default to limit for 'all' or 'database'
              const limit = settings.count || 6;
              mapped = mapped.slice(0, limit);
            }

            setDisplayReviews(mapped);
          }
        } catch (error) {
          console.error("Failed to load reviews:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setDisplayReviews(settings.reviews || []);
      }
    }

    loadData();
  }, [settings.source, settings.reviews, settings.count, settings.reviewIds]);

  useEffect(() => {
    if (carouselRef.current) {
      setWidth(carouselRef.current.scrollWidth - carouselRef.current.offsetWidth);
    }
  }, [displayReviews]);

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

  const columns = settings.columns || 3;
  const mobileColumns = settings.mobileColumns || 1;

  const cardRadiusClass = styles?.cardRadius === 'small' ? 'rounded-lg' :
    styles?.cardRadius === 'large' ? 'rounded-[2rem]' :
      styles?.cardRadius === 'full' ? 'rounded-full' :
        styles?.cardRadius === 'none' ? 'rounded-none' : 'rounded-2xl';

  return (
    <div className="w-full">
      <div className="w-full">
        <div className={`flex justify-between items-end mb-10
           ${styles?.textAlign === 'center' ? 'flex-col items-center justify-center gap-6 text-center' : ''}
           ${styles?.textAlign === 'right' ? 'flex-row-reverse text-right' : ''} 
           ${!styles?.textAlign || styles?.textAlign === 'left' ? 'text-left' : ''}
        `}>
          {settings?.title && (
            <h2
              className="text-2xl md:text-3xl font-black uppercase tracking-tight"
              style={{ color: styles?.headlineColor || styles?.color || 'inherit' }}
            >
              {settings?.title}
            </h2>
          )}
          {displayReviews.length > 0 && (
            <div className="flex gap-3">
              <button
                onClick={slideLeft}
                className="w-10 h-10 md:w-12 md:h-12 rounded-full border flex items-center justify-center hover:bg-slate-100 dark:hover:bg-white/10 transition-all"
                style={{ borderColor: styles?.headlineColor || styles?.color || 'currentColor' }}
              >
                <ArrowLeft className="w-5 h-5" style={{ color: styles?.headlineColor || styles?.color || 'inherit' }} />
              </button>
              <button
                onClick={slideRight}
                className="w-10 h-10 md:w-12 md:h-12 rounded-full border flex items-center justify-center hover:bg-slate-100 dark:hover:bg-white/10 transition-all"
                style={{ borderColor: styles?.headlineColor || styles?.color || 'currentColor' }}
              >
                <ArrowRight className="w-5 h-5" style={{ color: styles?.headlineColor || styles?.color || 'inherit' }} />
              </button>
            </div>
          )}
        </div>

        {loading ? (
          <div className={settings.layout === 'grid'
            ? `grid gap-6 ${getGridCols(mobileColumns)} ${getMdGridCols(columns)}`
            : 'flex gap-6 overflow-hidden pb-8'
          }>
            {[...Array(settings.layout === 'grid' ? (settings.count || 3) : 3)].map((_, i) => (
              <div key={i} className={`${settings.layout === 'grid' ? 'w-full' : 'min-w-[300px] md:min-w-[450px] flex-1'} bg-slate-50 dark:bg-white/5 p-8 ${cardRadiusClass} border border-slate-100 dark:border-white/10 shrink-0 animate-pulse`}>
                <div className="flex gap-1 mb-6">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 text-slate-200 dark:text-white/10" />
                  ))}
                </div>
                <div className="h-4 bg-slate-200 dark:bg-white/10 rounded w-3/4 mb-4" />
                <div className="h-4 bg-slate-200 dark:bg-white/10 rounded w-1/2 mb-10" />
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-800" />
                  <div className="flex-1">
                    <div className="h-4 bg-slate-200 dark:bg-white/10 rounded w-24 mb-2" />
                    <div className="h-3 bg-slate-200 dark:bg-white/10 rounded w-32" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : settings.layout === 'grid' ? (
          <div className={`grid gap-6 ${getGridCols(mobileColumns)} ${getMdGridCols(columns)}`}>
            {displayReviews.length > 0 ? (
              displayReviews.map((review: any) => (
                <div
                  key={review.id}
                  className={`w-full bg-slate-50 dark:bg-white/5 p-8 ${cardRadiusClass} border border-slate-100 dark:border-white/10`}
                >
                  <div className="flex gap-1 mb-6">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < (review.rating || 5) ? 'fill-amber-400 text-amber-400' : 'text-slate-200 dark:text-white/10'}`} />
                    ))}
                  </div>
                  <blockquote
                    className="text-lg md:text-xl mb-8 italic leading-snug"
                    style={{ color: styles?.color || 'inherit' }}
                  >
                    "{review.text}"
                  </blockquote>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-700">
                      {review.avatar && !review.avatar.startsWith('bg-') ? (
                        <img src={review.avatar} alt={review.author} className="w-full h-full object-cover" />
                      ) : (
                        <span>👤</span>
                      )}
                    </div>
                    <div>
                      <p
                        className="text-base font-black uppercase tracking-tight"
                        style={{ color: styles?.sublineColor || '#3b82f6' }}
                      >
                        {review.author}
                      </p>
                      <p className="text-[9px] text-slate-500 uppercase tracking-[0.2em] font-bold">
                        {settings.source === 'database' ? 'Verified Purchase' : 'Verified Client'}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className={`col-span-full py-16 text-center text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-800 ${cardRadiusClass}`}>
                No reviews found
              </div>
            )}
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
              {displayReviews.length > 0 ? (
                displayReviews.map((review: any) => (
                  <motion.div
                    key={review.id}
                    className={`min-w-[300px] md:min-w-[450px] bg-slate-50 dark:bg-white/5 p-8 ${cardRadiusClass} border border-slate-100 dark:border-white/10 shrink-0 select-none pointer-events-auto`}
                  >
                    <div className="flex gap-1 mb-6">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-4 h-4 ${i < (review.rating || 5) ? 'fill-amber-400 text-amber-400' : 'text-slate-200 dark:text-white/10'}`} />
                      ))}
                    </div>
                    <blockquote
                      className="text-lg md:text-xl mb-8 italic leading-snug"
                      style={{ color: styles?.color || 'inherit' }}
                    >
                      "{review.text}"
                    </blockquote>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-700">
                        {review.avatar && !review.avatar.startsWith('bg-') ? (
                          <img src={review.avatar} alt={review.author} className="w-full h-full object-cover" />
                        ) : (
                          <span>👤</span>
                        )}
                      </div>
                      <div>
                        <p
                          className="text-base font-black uppercase tracking-tight"
                          style={{ color: styles?.sublineColor || '#3b82f6' }}
                        >
                          {review.author}
                        </p>
                        <p className="text-[9px] text-slate-500 uppercase tracking-[0.2em] font-bold">
                          {settings.source === 'database' ? 'Verified Purchase' : 'Verified Client'}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className={`w-full py-16 text-center text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-800 ${cardRadiusClass}`}>
                  {settings.source === 'database'
                    ? 'No reviews found in database'
                    : 'Add social proof in the customizer'
                  }
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
