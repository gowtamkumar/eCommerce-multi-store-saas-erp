"use client";

import { useSettings } from '@/contexts/SettingsContext';
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Check,
  Play,
  Share2,
  Star,
  X
} from "lucide-react";
import Image from "next/image";
import { useState } from 'react';
import toast from 'react-hot-toast';
import CheckoutModal from "./CheckoutModal";
import LucideIcon from './LucideIcon';

interface HeroProps {
  product: any;
}

const Hero = ({ product }: HeroProps) => {
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const { settings, selectedCurrency, formatPrice, convertPrice } = useSettings();

  const handleShare = async () => {
    const shareData = {
      title: product.name,
      text: product.tagline || product.description?.substring(0, 100),
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };



  if (!product) return null;

  return (
    <>

      <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-[20%] -right-[10%] w-[70%] h-[70%] rounded-full bg-brand-500/10 blur-3xl" />
          <div className="absolute top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-indigo-500/10 blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-8"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-50 dark:bg-brand-900/30 border border-brand-100 dark:border-brand-800 text-brand-600 dark:text-brand-300 text-sm font-medium">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500"></span>
                </span>
                {product.releaseBadgeText || "New Release 2024"}
              </div>

              <h1 className="text-5xl lg:text-7xl font-bold tracking-tight font-display text-balance">
                {product.name} {product.tagline && <br />}
                {product.tagline && <span className="text-gradient">{product.tagline}</span>}
              </h1>

              <div className="text-lg text-slate-600 dark:text-slate-300 max-w-xl leading-relaxed prose prose-lg dark:prose-invert" dangerouslySetInnerHTML={{ __html: product.description }} />

              <div className="space-y-2">
                {product.discountAmount > 0 ? (
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col">
                      <span className="text-slate-400 line-through text-sm font-medium">
                        {formatPrice(product.price)}
                      </span>
                      <span className="text-4xl font-bold text-slate-900 dark:text-white font-display">
                        {formatPrice((product.price - product.discountAmount))}
                      </span>
                    </div>
                    <div className="px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-sm font-bold animate-bounce-subtle">
                      SAVE {formatPrice(product.discountAmount)}
                    </div>
                  </div>
                ) : (
                  <span className="text-4xl font-bold text-slate-900 dark:text-white font-display">
                    {formatPrice(product?.price || 0)}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => setIsCheckoutOpen(true)}
                  className="px-8 py-4 bg-brand-600 hover:bg-brand-700 text-white rounded-full font-semibold transition-all shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40 flex items-center gap-2 group"
                >
                  Buy Now - {formatPrice(product.price - (product.discountAmount || 0))}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={() => product.videoUrl ? setIsVideoOpen(true) : toast.error('No video available for this product')}
                  className="px-8 py-4 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-full font-semibold transition-all flex items-center gap-2"
                >
                  <Play className="w-4 h-4 fill-current" />
                  Watch Demo
                </button>
                <button
                  onClick={handleShare}
                  className="p-4 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-full font-semibold transition-all flex items-center gap-2 relative"
                  title="Share Product"
                >
                  {copied ? (
                    <Check className="w-5 h-5 text-green-500" />
                  ) : (
                    <Share2 className="w-5 h-5" />
                  )}
                  {copied && (
                    <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-900 text-white text-[10px] rounded shadow-lg whitespace-nowrap animate-in fade-in slide-in-from-bottom-1">
                      Link Copied!
                    </span>
                  )}
                </button>
              </div>

              <div className="flex items-center gap-4 pt-4">
                <div className="flex -space-x-3">
                  {(product.socialProof?.avatars?.length > 0
                    ? product.socialProof.avatars
                    : [1, 2, 3, 4].map(i => `https://i.pravatar.cc/100?img=${i + 10}`)
                  ).map((avatar: string, i: number) => (
                    <div
                      key={i}
                      className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-900 bg-slate-200 dark:bg-slate-700 overflow-hidden"
                    >
                      <Image
                        src={avatar}
                        alt="User"
                        width={40}
                        height={40}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
                <div className="space-y-1">
                  <div className="flex text-yellow-400">
                    {Array.from({ length: Math.min(5, Math.max(1, product.socialProof?.rating || 5)) }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    Loved by {product.socialProof?.count?.toLocaleString() || '2,000'}+ {product.socialProof?.noun || 'customers'}
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="relative z-10 rounded-3xl overflow-hidden shadow-2xl border border-white/20 dark:border-slate-700/30 glass-card p-2">
                {/* Placeholder for Product Image - Using a generic high-quality headphone image */}
                <div className="relative aspect-square rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800">
                  <Image
                    src={
                      product.images[0] ||
                      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1000&auto=format&fit=crop"
                    }
                    alt={product.name}
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-700"
                    priority
                  />
                </div>
              </div>

              {/* Floating Elements - Dynamic Highlights */}
              {product.heroHighlights && product.heroHighlights.length > 0 && (
                <div className="absolute inset-0 pointer-events-none">
                  {product.heroHighlights.map((highlight: any, index: number) => {
                    const colorClasses = {
                      green: "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400",
                      blue: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
                      purple: "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400",
                      orange: "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400",
                      red: "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400",
                      brand: "bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400",
                    };

                    const isLeft = index % 2 === 0;
                    const position = isLeft
                      ? "absolute top-1/4 -left-12 lg:-left-20 flex items-center gap-4"
                      : "absolute bottom-1/4 -right-12 lg:-right-20 flex flex-row-reverse items-center gap-4 text-right";

                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: isLeft ? -20 : 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1 + index * 0.2, duration: 0.8 }}
                        className={`${position} glass p-4 rounded-2xl shadow-lg z-20 hidden md:block border border-white/20 dark:border-slate-700/50 hover:scale-105 pointer-events-auto transition-transform duration-300`}
                      >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${colorClasses[highlight.color as keyof typeof colorClasses] || colorClasses.blue}`}>
                          <LucideIcon name={highlight.icon} className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                            {highlight.label}
                          </p>
                          <p className="font-bold text-slate-900 dark:text-white">
                            {highlight.value}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </section>
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        product={product}
      />

      {/* Video Modal */}
      <AnimatePresence>
        {isVideoOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsVideoOpen(false)}
              className="absolute inset-0 bg-slate-900/90 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-5xl aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl border border-white/10"
            >
              <button
                onClick={() => setIsVideoOpen(false)}
                className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              {product.videoUrl ? (
                product.videoUrl.includes('youtube.com') || product.videoUrl.includes('youtu.be') ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${product.videoUrl.split('v=')[1] || product.videoUrl.split('/').pop()}?autoplay=1`}
                    className="w-full h-full"
                    allow="autoplay; encrypted-media"
                    allowFullScreen
                  />
                ) : (
                  <video
                    src={product.videoUrl}
                    controls
                    autoPlay
                    className="w-full h-full"
                  />
                )
              ) : (
                <div className="flex items-center justify-center h-full text-white">
                  Video not found
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Hero;
