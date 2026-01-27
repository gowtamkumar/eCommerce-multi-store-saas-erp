"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

interface ProductSliderProps {
  headline?: string;
  count?: number;
  collectionId?: string; // This is the category slug/id
  styles?: any;
}

export default function BannerSlider({ settings, styles }: any) {
  // eslint-disable-next-line
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = settings?.slides?.length > 0 ? settings.slides : [{
    id: 'default',
    headline: settings?.headline || 'Summer Collection 2026',
    subline: settings?.subline || 'Discover the latest trends in luxury fashion and accessories.',
    backgroundImage: settings?.backgroundImage,
    primaryButtonText: settings?.primaryButtonText,
    primaryButtonLink: settings?.primaryButtonLink,
    secondaryButtonText: settings?.secondaryButtonText,
    secondaryButtonLink: settings?.secondaryButtonLink,
  }];

  // Auto-play
  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const currentContent = slides[currentSlide];


  return (
    <div
      style={{
        ...styles,
        height: '600px' // fixed height for slider
      }}
      className="relative group overflow-hidden bg-slate-100 dark:bg-slate-800"
    >
      <AnimatePresence mode='wait'>
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7 }}
          className="absolute inset-0 w-full h-full bg-cover bg-center"
          style={{
            backgroundImage: currentContent?.backgroundImage ? `url(${currentContent.backgroundImage})` : undefined,
          }}
        >
          <div className="absolute inset-0 bg-black/40 z-0" />
        </motion.div>
      </AnimatePresence>

      <div className="relative z-10 h-full flex items-center justify-center px-4 md:px-10 text-left w-full max-w-7xl mx-auto">
        <AnimatePresence mode='wait'>
          <motion.div
            key={`content-${currentSlide}`}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="w-full"
          >
            <span className="inline-block px-3 py-1 bg-brand-600 text-white text-[10px] font-bold uppercase tracking-widest rounded-full mb-4">New Season</span>
            <h1 className="text-4xl md:text-7xl font-extrabold text-white mb-4 leading-tight drop-shadow-lg">
              {currentContent?.headline || 'Summer Collection 2026'}
            </h1>
            <p className="text-lg md:text-2xl text-white/90 max-w-2xl mb-8 leading-relaxed font-medium">
              {currentContent?.subline || 'Discover the latest trends in luxury fashion and accessories.'}
            </p>
            <div className="flex flex-wrap gap-4">
              {(currentContent?.primaryButtonText || currentContent?.primaryButtonLink) && (
                <Link
                  href={currentContent.primaryButtonLink || "#"}
                  className="px-8 py-3 bg-white text-brand-600 font-bold rounded-lg shadow-xl hover:scale-105 transition-transform">
                  {currentContent.primaryButtonText || "Shop Now"}
                </Link>
              )}
              {(currentContent?.secondaryButtonText || currentContent?.secondaryButtonLink) && (
                <Link
                  href={currentContent.secondaryButtonLink || "#"}
                  className="px-8 py-3 bg-white/10 text-white border border-white/30 backdrop-blur-md font-bold rounded-lg hover:bg-white/20 transition-all">
                  {currentContent.secondaryButtonText || "Learn More"}
                </Link>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Controls */}
      {slides.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-white/20 transition-all opacity-0 group-hover:opacity-100 z-20"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-white/20 transition-all opacity-0 group-hover:opacity-100 z-20"
          >
            <ChevronRight className="w-8 h-8" />
          </button>

          {/* Dots */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-3 z-20">
            {slides.map((_: any, idx: number) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`w-3 h-3 rounded-full transition-all ${currentSlide === idx ? 'bg-white w-8' : 'bg-white/50 hover:bg-white/80'}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
