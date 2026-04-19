'use client';
import { Quote, Star } from 'lucide-react';
import { useEffect, useState } from 'react';
import { DisplayItem } from '../type';

const Reviews = ({ reviews }: { reviews: DisplayItem[] }) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <section id="reviews" className="py-32 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-slate-600 dark:text-slate-400">Loading feedback...</p>
          </div>
        </div>
      </section>
    );
  }

  if (reviews?.length === 0) {
    return null;
  }

  return (
    <section id="reviews" className="py-24 bg-slate-50 dark:bg-slate-900 overflow-hidden relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
        <div className="absolute top-[20%] left-[10%] w-72 h-72 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-[20%] right-[10%] w-72 h-72 bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-brand-600 dark:text-brand-400 font-semibold tracking-wide uppercase text-sm mb-3">
            Product Reviews
          </h2>
          <h2 className="text-4xl md:text-5xl font-bold font-display text-slate-900 dark:text-white mb-6">
            Loved by Thousands
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Read what our customers are saying about our premium products.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {reviews?.map((item, idx) => (
            <div key={idx} className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 dark:border-slate-700 hover:-translate-y-1 group">
              <div className="flex items-center gap-4 mb-6">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center font-bold text-xl text-white shadow-lg ${item.avatar && item.avatar.startsWith('bg-')
                  ? item.avatar
                  : 'bg-gradient-to-br from-brand-500 to-indigo-600'
                  }`}>
                  {item.customerName?.[0]?.toUpperCase() || 'A'}
                </div>
                <div>
                  <h4 className="font-bold text-lg text-slate-900 dark:text-white leading-tight">{item.customerName || 'Anonymous Customer'}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-green-500"></span>
                      Verified Purchase
                    </span>
                    {item.createdAt && (
                      <span className="text-xs text-slate-400">• {new Date(item.createdAt).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${i < item.rating
                      ? 'text-yellow-400 fill-yellow-400'
                      : 'text-slate-200 dark:text-slate-700'
                      }`}
                  />
                ))}
              </div>

              <div className="relative">
                <Quote className="absolute -top-2 -left-2 w-8 h-8 text-brand-100 dark:text-brand-900/30 rotate-180" />
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-6 pl-4 relative z-10">
                  "{item.comment}"
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Reviews;

