'use client';

import { useRecentlyViewed } from '@/hooks/useRecentlyViewed';
import ProductCard from '@/features/admin/product/components/ProductCard';
import { Trash2, History } from 'lucide-react';

export default function RecentlyViewedProducts() {
    const { recentProducts, clearHistory } = useRecentlyViewed();

    if (recentProducts.length === 0) {
        return null;
    }

    return (
        <section className="py-16 bg-slate-50 dark:bg-slate-900/50">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center text-brand-600 dark:text-brand-400">
                            <History className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                                Recently Viewed
                            </h2>
                            <p className="text-slate-500 dark:text-slate-400 text-sm">
                                Based on your browsing history
                            </p>
                        </div>
                    </div>
                    
                    <button 
                        onClick={clearHistory}
                        className="flex items-center gap-2 text-slate-400 hover:text-rose-500 transition-colors text-sm font-bold uppercase tracking-widest"
                    >
                        <Trash2 className="w-4 h-4" />
                        Clear All
                    </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {recentProducts.map((product) => (
                        <div key={product.id} className="h-full">
                            <ProductCard product={product} />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
