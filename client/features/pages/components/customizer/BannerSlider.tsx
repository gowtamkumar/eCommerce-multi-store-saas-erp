"use client";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { BannerSliderProps } from "../../type";


export default function BannerSlider({ settings, styles }: BannerSliderProps) {
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

  console.log("slides", slides);

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
    <section
      style={{
        ...styles, // Spread ALL styles including CSS custom properties
        height: styles?.height ? `${styles.height}px` : '600px',
        paddingTop: styles?.paddingTop,
        paddingBottom: styles?.paddingBottom,
        backgroundColor: styles?.backgroundColor,
        color: styles?.color
      }}
      className="relative group overflow-hidden bg-slate100 dark:bg-slate-800"
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
          <div
            className="absolute inset-0 bg-black/40 z-0 transition-all duration-300"
            style={{ opacity: styles?.overlayOpacity !== undefined ? styles.overlayOpacity / 100 : 0.4 }}
          />
        </motion.div>
      </AnimatePresence>

      <div className={`relative z-10 h-full flex items-center px-4 md:px-10 w-full max-w-7xl mx-auto
        ${styles?.textAlign === 'center' ? 'justify-center text-center' : ''}
        ${styles?.textAlign === 'right' ? 'justify-end text-right' : ''}
        ${!styles?.textAlign || styles?.textAlign === 'left' ? 'justify-start text-left' : ''}
      `}>
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
            <h1
              className="text-4xl md:text-7xl font-extrabold mb-4 leading-tight drop-shadow-lg"
              style={{ color: styles?.headlineColor || '#ffffff' }}
            >
              {currentContent?.headline || 'Summer Collection 2026'}
            </h1>
            <p
              className={`text-lg md:text-2xl max-w-2xl mb-8 leading-relaxed font-medium
                ${styles?.textAlign === 'center' ? 'mx-auto' : ''}
                ${styles?.textAlign === 'right' ? 'ml-auto' : ''}
              `}
              style={{ color: styles?.sublineColor || 'rgba(255, 255, 255, 0.9)' }}
            >
              {currentContent?.subline || 'Discover the latest trends in luxury fashion and accessories.'}
            </p>
            <div className={`flex flex-wrap gap-4
              ${styles?.textAlign === 'center' ? 'justify-center' : ''}
              ${styles?.textAlign === 'right' ? 'justify-end' : ''}
              ${!styles?.textAlign || styles?.textAlign === 'left' ? 'justify-start' : ''}
            `}>
              {(currentContent?.primaryButtonText || currentContent?.primaryButtonLink) && (
                <Link
                  href={currentContent.primaryButtonLink || "#"}
                  className="px-8 py-3 bg-white text-brand-600 font-bold rounded-lg shadow-xl hover:scale-105 transition-transform"
                  style={{
                    backgroundColor: styles?.buttonColor || '#ffffff',
                    color: styles?.buttonTextColor || '#2563eb'
                  }}
                >
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
    </section>
  );
}
