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

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000); // Slightly longer for better readability
    return () => clearInterval(timer);
  }, [slides.length]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  const currentContent = slides[currentSlide];

  // Calculate overlay opacity
  const overlayOpacity = styles?.overlayOpacity !== undefined ? styles.overlayOpacity / 100 : 0.4;
  const borderRadius = styles?.borderRadius || 0;

  return (
    <div
      className="relative group w-full flex flex-col transition-all duration-300"
      style={{
        height: styles?.height ? (typeof styles.height === 'number' ? `${styles.height}px` : styles.height) : '600px',
        width: styles?.width || '100%',
        maxWidth: styles?.maxWidth || 'none',
        backgroundColor: styles?.backgroundColor || '#000',
        marginTop: styles?.marginTop || 0,
        marginBottom: styles?.marginBottom || 0,
        borderRadius: borderRadius,
        borderWidth: styles?.borderWidth || 0,
        borderColor: styles?.borderColor || 'transparent',
        borderStyle: styles?.borderStyle || 'solid',
        boxShadow: styles?.boxShadow || 'none',
        opacity: styles?.opacity !== undefined ? styles.opacity : 1,

        // ROBUST CLIPPING FIX
        overflow: 'hidden',
        isolation: 'isolate',
        WebkitMaskImage: '-webkit-radial-gradient(white, black)',
        transform: 'translateZ(0)',

        boxSizing: 'border-box',
        marginLeft: styles?.textAlign === 'center' ? 'auto' : undefined,
        marginRight: styles?.textAlign === 'center' ? 'auto' : undefined,
      } as any}
    >
      <AnimatePresence mode='wait'>
        <motion.div
          key={currentSlide}
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="absolute inset-0 w-full h-full bg-cover bg-center"
          style={{
            backgroundImage: currentContent?.backgroundImage ? `url("${currentContent.backgroundImage}")` : undefined,
            borderRadius: borderRadius,
          }}
        >
          {/* Enhanced Overlay with Gradient */}
          <div
            className="absolute inset-0 z-0 transition-all duration-700"
            style={{
              background: `linear-gradient(to bottom, rgba(0,0,0,${overlayOpacity * 0.5}), rgba(0,0,0,${overlayOpacity}))`,
              borderRadius: borderRadius,
            }}
          />
        </motion.div>
      </AnimatePresence>

      <div
        className={`relative z-10 h-full flex items-center w-full max-w-7xl mx-auto
          ${styles?.textAlign === 'center' ? 'justify-center text-center' : ''}
          ${styles?.textAlign === 'right' ? 'justify-end text-right' : ''}
          ${!styles?.textAlign || styles?.textAlign === 'left' ? 'justify-start text-left' : ''}
        `}
        style={{
          paddingTop: styles?.paddingTop || 0,
          paddingBottom: styles?.paddingBottom || 0,
          paddingLeft: styles?.paddingLeft || '2rem',
          paddingRight: styles?.paddingRight || '2rem',
          boxSizing: 'border-box'
        } as any}
      >
        <AnimatePresence mode='wait'>
          <motion.div
            key={`content-${currentSlide}`}
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -30, opacity: 0 }}
            transition={{ duration: 0.8, ease: "circOut" }}
            className="w-full max-w-2xl px-0 md:px-14"
          >
            <h1
              className="text-5xl md:text-8xl font-black mb-6 leading-[1.1] tracking-tight drop-shadow-2xl"
              style={{
                color: styles?.headlineColor || '#ffffff',
                fontWeight: styles?.fontWeight || '900',
                lineHeight: styles?.lineHeight || '1.1',
                textTransform: (styles?.textTransform as any) || 'none',
                fontSize: styles?.fontSize ? (typeof styles.fontSize === 'number' ? `${styles.fontSize}px` : styles.fontSize) : undefined
              }}
            >
              {currentContent?.headline}
            </h1>
            <p
              className={`text-lg md:text-2xl mb-10 leading-relaxed font-medium opacity-90
                ${styles?.textAlign === 'center' ? 'mx-auto' : ''}
                ${styles?.textAlign === 'right' ? 'ml-auto' : ''}
              `}
              style={{ color: styles?.sublineColor || 'rgba(255, 255, 255, 0.9)' }}
            >
              {currentContent?.subline}
            </p>
            <div className={`flex flex-wrap gap-5
              ${styles?.textAlign === 'center' ? 'justify-center' : ''}
              ${styles?.textAlign === 'right' ? 'justify-end' : ''}
              ${!styles?.textAlign || styles?.textAlign === 'left' ? 'justify-start' : ''}
            `}>
              {(currentContent?.primaryButtonText) && (
                <Link
                  href={currentContent.primaryButtonLink || "#"}
                  className="px-10 py-4 font-black rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 uppercase tracking-widest text-xs"
                  style={{
                    backgroundColor: styles?.buttonColor || '#ffffff',
                    color: styles?.buttonTextColor || '#2563eb'
                  }}
                >
                  {currentContent.primaryButtonText}
                </Link>
              )}
              {(currentContent?.secondaryButtonText) && (
                <Link
                  href={currentContent.secondaryButtonLink || "#"}
                  className="px-10 py-4 bg-white/10 text-white border-2 border-white/20 backdrop-blur-xl font-black rounded-full hover:bg-white/20 active:scale-95 transition-all duration-300 uppercase tracking-widest text-xs">
                  {currentContent.secondaryButtonText}
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
            className="absolute left-6 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-all opacity-0 group-hover:opacity-100 z-20 scale-90 group-hover:scale-100 duration-500"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-6 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-all opacity-0 group-hover:opacity-100 z-20 scale-90 group-hover:scale-100 duration-500"
          >
            <ChevronRight className="w-8 h-8" />
          </button>

          {/* Premium Progress Indicators */}
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-4 z-20">
            {slides.map((_: any, idx: number) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className="relative h-1.5 transition-all duration-500 overflow-hidden rounded-full bg-white/20"
                style={{ width: currentSlide === idx ? '48px' : '12px' }}
              >
                {currentSlide === idx && (
                  <motion.div
                    initial={{ x: "-100%" }}
                    animate={{ x: "0%" }}
                    transition={{ duration: 6, ease: "linear" }}
                    className="absolute inset-0 bg-white"
                  />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
