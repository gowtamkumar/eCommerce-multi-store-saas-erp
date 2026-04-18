'use client';

import ProductCard, { PromotionTypeBadge } from '@/features/product/components/ProductCard';
import { PromotionType } from '@/lib/enums/promotion-type.enum';
import { ArrowLeft, Clock, Package, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { PromotionDetailsProps } from '../types';



// interface Promotion {
//     id: string;
//     name: string;
//     slug: string;
//     description?: string;
//     promotionType: PromotionType;
//     value?: number;
//     targetType: string;
//     minOrderValue?: number;
//     startDate?: string;
//     endDate?: string;
//     isActive: boolean;
// }



// Countdown timer hook (reused from OffersPage)
function useCountdown(endDate?: string) {
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

    useEffect(() => {
        if (!endDate) return;
        const interval = setInterval(() => {
            const end = new Date(endDate).getTime();
            const now = Date.now();
            const diff = end - now;
            if (diff <= 0) {
                clearInterval(interval);
                return;
            }
            setTimeLeft({
                days: Math.floor(diff / (1000 * 60 * 60 * 24)),
                hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
                seconds: Math.floor((diff % (1000 * 60)) / 1000),
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [endDate]);

    return timeLeft;
}


export default function PromotionDetails({ promotion, products }: PromotionDetailsProps) {
    const timeLeft = useCountdown(promotion.endDate);
    const hasEndDate = !!promotion.endDate;
    const isExpiringSoon = hasEndDate && timeLeft.days < 2;

    return (
        <div className="pt-32 pb-24">
            <div className="container mx-auto px-4">
                <Link href="/offers" className="inline-flex items-center gap-2 text-slate-500 hover:text-brand-600 mb-8 transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                    Back to all offers
                </Link>

                {/* Hero Header */}
                <div className={`relative overflow-hidden rounded-[3rem] mb-16 p-12 md:p-16 ${isExpiringSoon
                    ? 'bg-gradient-to-br from-rose-900 via-orange-800 to-amber-900 text-white'
                    : 'bg-slate-50 dark:bg-slate-800/20 text-slate-900 dark:text-white border border-slate-100 dark:border-slate-800'
                    }`}>
                    {/* Glowing background blobs */}
                    {!isExpiringSoon && (
                        <>
                            <div className="absolute -top-24 -right-24 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl z-0" />
                            <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-brand-600/5 rounded-full blur-3xl z-0" />
                        </>
                    )}
                    {isExpiringSoon && (
                        <>
                            <div className="absolute top-0 left-1/4 w-72 h-72 bg-white/10 rounded-full blur-3xl pointer-events-none" />
                            <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-white/5 rounded-full blur-3xl pointer-events-none" />
                        </>
                    )}

                    <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-12">
                        <div className="max-w-3xl">
                            <div className="flex items-center gap-3 mb-6">
                                <PromotionTypeBadge type={promotion.targetType} />
                                {promotion.isActive ? (
                                    <span className={`px-3 py-1.5 backdrop-blur-md text-[10px] font-black uppercase tracking-widest rounded-full border ${isExpiringSoon ? 'bg-white/10 text-white border-white/20' : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'}`}>
                                        Active Now
                                    </span>
                                ) : (
                                    <span className={`px-3 py-1.5 backdrop-blur-md text-[10px] font-black uppercase tracking-widest rounded-full border ${isExpiringSoon ? 'bg-white/10 text-white border-white/20' : 'bg-slate-500/10 text-slate-400 border-slate-500/20'}`}>
                                        Ended
                                    </span>
                                )}
                            </div>
                            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black mb-6 leading-tight tracking-tight">
                                {promotion.name}
                            </h1>
                            <p className="text-lg md:text-xl font-medium opacity-80 mb-8 max-w-2xl">
                                {promotion.description || "Grab these limited time deals while they last! Our best prices on premium products."}
                            </p>

                            <div className="flex flex-wrap gap-4">
                                {promotion.promotionType === PromotionType.PERCENTAGE && promotion.value && (
                                    <div className={`flex flex-col rounded-3xl p-6 border min-w-[160px] ${isExpiringSoon ? 'bg-white/10 border-white/10' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 shadow-sm'}`}>
                                        <span className="opacity-60 text-[10px] font-black uppercase tracking-widest mb-1">Discount</span>
                                        <span className="text-3xl font-black">{promotion.value}% OFF</span>
                                    </div>
                                )}
                                {promotion.promotionType === PromotionType.FIXED && promotion.value && (
                                    <div className={`flex flex-col rounded-3xl p-6 border min-w-[160px] ${isExpiringSoon ? 'bg-white/10 border-white/10' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 shadow-sm'}`}>
                                        <span className="opacity-60 text-[10px] font-black uppercase tracking-widest mb-1">Flat Discount</span>
                                        <span className="text-3xl font-black">{promotion.value} OFF</span>
                                    </div>
                                )}
                                {promotion.minOrderValue && (
                                    <div className={`flex flex-col rounded-3xl p-6 border min-w-[160px] ${isExpiringSoon ? 'bg-white/10 border-white/10' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 shadow-sm'}`}>
                                        <span className="opacity-60 text-[10px] font-black uppercase tracking-widest mb-1">Min. Purchase</span>
                                        <span className="text-3xl font-black">{promotion.minOrderValue}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Countdown Timer */}
                        {hasEndDate && (
                            <div className={`rounded-[3rem] p-8 border flex flex-col items-center ${isExpiringSoon ? 'bg-white/10 border-white/10 backdrop-blur-xl' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 shadow-xl'}`}>
                                <p className={`text-[10px] font-black mb-6 uppercase tracking-[0.2em] flex items-center gap-2 ${isExpiringSoon ? 'text-white' : 'text-slate-400'}`}>
                                    <Clock className={`w-4 h-4 ${isExpiringSoon ? 'text-amber-400' : 'text-brand-500'}`} />
                                    {isExpiringSoon ? 'Hurry! Expiring Soon' : 'Promotion Ends In'}
                                </p>
                                <div className="flex items-center gap-4 sm:gap-6">
                                    {[
                                        { v: timeLeft.days, l: 'Days' },
                                        { v: timeLeft.hours, l: 'Hrs' },
                                        { v: timeLeft.minutes, l: 'Min' },
                                        { v: timeLeft.seconds, l: 'Sec' },
                                    ].map(({ v, l }) => (
                                        <div key={l} className="flex flex-col items-center">
                                            <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center border transition-all ${isExpiringSoon ? 'bg-white/10 border-white/10' : 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 shadow-inner'}`}>
                                                <span className="text-2xl sm:text-3xl font-black tabular-nums">
                                                    {String(v).padStart(2, '0')}
                                                </span>
                                            </div>
                                            <span className={`text-[10px] mt-3 font-black uppercase tracking-widest opacity-40`}>{l}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Section Title */}
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <ShoppingBag className="w-6 h-6 text-brand-600" />
                        Explore Special Deals ({products.length})
                    </h2>
                </div>

                {products.length === 0 ? (
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-3xl py-16 text-center border-2 border-dashed border-slate-200 dark:border-slate-800">
                        <Package className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">No Products Available</h3>
                        <p className="text-slate-500">There are currently no active products in this promotion.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
                        {products.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
