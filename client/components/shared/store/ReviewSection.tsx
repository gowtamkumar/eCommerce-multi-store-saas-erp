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

  return (
    <section
      style={{
        ...styles, // Spread ALL styles including CSS custom properties
        paddingTop: styles?.paddingTop,
        paddingBottom: styles?.paddingBottom,
        backgroundColor: styles?.backgroundColor || '#020617', // slate-950 default
        color: styles?.color
      }}
      className={`px-4 md:px-10 border-y border-white/5 overflow-hidden ${!styles?.paddingTop && !styles?.paddingBottom ? 'py-16 md:py-24' : ''}`}
    >
      <div className="max-w-7xl mx-auto">
        <div className={`flex justify-between items-end mb-16
           ${styles?.textAlign === 'center' ? 'flex-col items-center justify-center gap-6 text-center' : ''}
           ${styles?.textAlign === 'right' ? 'flex-row-reverse text-right' : ''} 
           ${!styles?.textAlign || styles?.textAlign === 'left' ? 'text-left' : ''}
        `}>
          <h2
            className="text-3xl font-black uppercase tracking-widest"
            style={{ color: styles?.headlineColor || styles?.color || 'white' }}
          >
            {settings?.title || 'Client Feedback'}
          </h2>
          <div className="flex gap-4">
            <button
              onClick={slideLeft}
              className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <button
              onClick={slideRight}
              className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className={`grid gap-8 ${settings.layout === 'grid' ? (settings.columns === 1 ? 'grid-cols-1' : settings.columns === 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3') : 'flex overflow-hidden pb-8'}`}>
            {[...Array(settings.layout === 'grid' ? (settings.count || 3) : 3)].map((_, i) => (
              <div key={i} className={`${settings.layout === 'grid' ? 'w-full' : 'min-w-[400px] md:min-w-[500px]'} bg-white/5 backdrop-blur-xl p-10 rounded-[3rem] border border-white/10 shrink-0 animate-pulse`}>
                <div className="flex gap-1 mb-8">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-5 h-5 text-white/10" />
                  ))}
                </div>
                <div className="h-4 bg-white/10 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-white/10 rounded w-1/2 mb-10"></div>
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 rounded-full bg-slate-800"></div>
                  <div>
                    <div className="h-4 bg-white/10 rounded w-24 mb-2"></div>
                    <div className="h-3 bg-white/10 rounded w-32"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : settings.layout === 'grid' ? (
          <div className={`grid gap-8 ${settings.columns === 1 ? 'grid-cols-1' : settings.columns === 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
            {displayReviews.length > 0 ? (
              displayReviews.map((review: any) => (
                <div
                  key={review.id}
                  className="w-full bg-white/5 backdrop-blur-xl p-10 rounded-[3rem] border border-white/10"
                >
                  <div className="flex gap-1 mb-8">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-5 h-5 ${i < (review.rating || 5) ? 'fill-amber-400 text-amber-400' : 'text-white/10'}`} />
                    ))}
                  </div>
                  <blockquote
                    className="text-xl md:text-2xl mb-10 italic leading-snug"
                    style={{ color: styles?.color || 'rgba(255, 255, 255, 0.9)' }}
                  >
                    "{review.text}"
                  </blockquote>
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center text-3xl overflow-hidden shadow-lg border-2 border-slate-700">
                      {review.avatar && !review.avatar.startsWith('bg-') ? (
                        <img src={review.avatar} alt={review.author} className="w-full h-full object-cover" />
                      ) : (
                        <span>👤</span>
                      )}
                    </div>
                    <div>
                      <p
                        className="text-lg md:text-xl font-black uppercase tracking-tight"
                        style={{ color: styles?.sublineColor || '#3b82f6' }}
                      >
                        {review.author}
                      </p>
                      <p className="text-[10px] text-slate-500 uppercase tracking-[0.3em] font-bold">
                        {settings.source === 'database' ? 'Verified Purchase' : 'Verified Client'}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-20 text-center text-white/10 border-4 border-dashed border-white/5 rounded-[3rem]">
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
              className="flex gap-8"
            >
              {displayReviews.length > 0 ? (
                displayReviews.map((review: any) => (
                  <motion.div
                    key={review.id}
                    className="min-w-[350px] md:min-w-[500px] bg-white/5 backdrop-blur-xl p-10 rounded-[3rem] border border-white/10 shrink-0 select-none pointer-events-auto"
                  >
                    <div className="flex gap-1 mb-8">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-5 h-5 ${i < (review.rating || 5) ? 'fill-amber-400 text-amber-400' : 'text-white/10'}`} />
                      ))}
                    </div>
                    <blockquote
                      className="text-xl md:text-2xl mb-10 italic leading-snug"
                      style={{ color: styles?.color || 'rgba(255, 255, 255, 0.9)' }}
                    >
                      "{review.text}"
                    </blockquote>
                    <div className="flex items-center gap-5">
                      <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center text-3xl overflow-hidden shadow-lg border-2 border-slate-700">
                        {review.avatar && !review.avatar.startsWith('bg-') ? (
                          <img src={review.avatar} alt={review.author} className="w-full h-full object-cover" />
                        ) : (
                          <span>👤</span>
                        )}
                      </div>
                      <div>
                        <p
                          className="text-lg md:text-xl font-black uppercase tracking-tight"
                          style={{ color: styles?.sublineColor || '#3b82f6' }} // brand-500 ish default
                        >
                          {review.author}
                        </p>
                        <p className="text-[10px] text-slate-500 uppercase tracking-[0.3em] font-bold">
                          {settings.source === 'database' ? 'Verified Purchase' : 'Verified Client'}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="w-full py-20 text-center text-white/10 border-4 border-dashed border-white/5 rounded-[3rem]">
                  {settings.source === 'database'
                    ? 'No reviews found in database'
                    : 'Add social proof in the customizer settings panel'
                  }
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
