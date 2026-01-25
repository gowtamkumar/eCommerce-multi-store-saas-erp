"use client";

import { fetchAPI } from "@/lib/api";
import { ReviewItem } from "@/types/customizer";
import { Star } from "lucide-react";
import { useEffect, useState } from "react";

interface ReviewSectionProps {
  settings: {
    title?: string;
    source?: 'manual' | 'database';
    count?: number;
    reviews?: ReviewItem[];
    [key: string]: any;
  };
  styles?: any;
}

export default function ReviewSection({ settings, styles }: ReviewSectionProps) {
  const [displayReviews, setDisplayReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadData() {
      if (settings.source === 'database') {
        setLoading(true);
        try {
          // Fetch Product Reviews
          // We use the public reviews endpoint which aggregates them, or we could fetch latest
          const data = await fetchAPI('/reviews/public');
          if (data.data) {
            let mapped = data.data.map((r: any) => ({
              id: r._id || r.id,
              customerName: r.customerName,
              comment: r.comment,
              rating: r.rating,
              avatar: r.avatar
            }));
            // Apply count limit
            const limit = settings.count || 6;
            mapped = mapped.slice(0, limit);

            setDisplayReviews(mapped);
          }
        } catch (error) {
          console.error("Failed to load reviews:", error);
        } finally {
          setLoading(false);
        }
      } else {
        // Manual mode
        setDisplayReviews(settings.reviews || []);
      }
    }

    loadData();
  }, [settings.source, settings.reviews, settings.count]); // Re-run when settings change

  return (
    <div style={styles} className="px-4 md:px-10 py-16 md:py-24 bg-slate-950 border-y border-white/5 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-center text-white text-3xl font-black mb-16 uppercase tracking-widest">
          {settings?.title || 'Client Feedback'}
        </h2>

        {loading ? (
          <div className="flex gap-8 overflow-x-hidden pb-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="min-w-[400px] md:min-w-[500px] bg-white/5 backdrop-blur-xl p-10 rounded-[3rem] border border-white/10 shrink-0 animate-pulse">
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
        ) : (
          <div className="flex gap-8 overflow-x-auto pb-8 scrollbar-hide">
            {displayReviews.length > 0 ? (
              displayReviews.map((review: any) => (
                <div key={review.id} className="min-w-[400px] md:min-w-[500px] bg-white/5 backdrop-blur-xl p-10 rounded-[3rem] border border-white/10 shrink-0">
                  <div className="flex gap-1 mb-8">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-5 h-5 ${i < (review.rating || 5) ? 'fill-amber-400 text-amber-400' : 'text-white/10'}`} />
                    ))}
                  </div>
                  <blockquote className="text-2xl text-white/90 mb-10 italic leading-snug">"{review.text}"</blockquote>
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center text-3xl overflow-hidden">
                      {review.avatar && !review.avatar.startsWith('bg-') ? (
                        <img src={review.avatar} alt={review.author} className="w-full h-full object-cover" />
                      ) : (
                        <span>👤</span>
                      )}
                    </div>
                    <div>
                      <p className="text-xl font-black text-brand-500 uppercase tracking-tight">{review.author}</p>
                      <p className="text-[10px] text-slate-500 uppercase tracking-[0.3em] font-bold">
                        {settings.source === 'database' ? 'Verified Purchase' : 'Verified Client'}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="w-full py-20 text-center text-white/10 border-4 border-dashed border-white/5 rounded-[3rem]">
                {settings.source === 'database'
                  ? 'No reviews found in database'
                  : 'Add social proof in the customizer settings panel'
                }
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
