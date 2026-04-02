"use client";

import { fetchAPI } from "@/services/api";
import { useEffect, useRef, useState, useMemo } from "react";
import SectionHeader from "./SectionHeader";
import { animate, motion, useMotionValue } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import ProductCard from "@/features/product/components/ProductCard";
import { ProductSliderProps } from "../../../type";

export default function ProductSlider({
  sectionId,
  headline,
  source = 'all',
  productIds = [],
  count = 8,
  collectionId,
  layout = 'slider',
  columns = 4,
  mobileColumns = 1,
  styles
}: ProductSliderProps & { sectionId?: string }) {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const carouselRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const x = useMotionValue(0);

  const uid = useMemo(() => `ps-${Math.random().toString(36).substring(2, 7)}`, []);

  useEffect(() => {
    async function loadProducts() {
      setLoading(true);
      try {
        let endpoint = `/products?limit=${source === 'manual' ? 100 : count}&status=active`;

        if (collectionId && source === 'collection') {
          endpoint += `&categoryId=${collectionId}`;
        }
        const res = await fetchAPI(endpoint);
        let fetchedProducts = res.data?.products || [];
        if (source === 'manual' && productIds.length > 0) {
          fetchedProducts = productIds
            .map(id => fetchedProducts.find((p: any) => p.id === id))
            .filter(Boolean);
        }

        setProducts(fetchedProducts);
      } catch (error) {
        console.error("Failed to fetch products for slider:", error);
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, [count, collectionId, source, JSON.stringify(productIds)]);

  useEffect(() => {
    const updateWidth = () => {
      if (carouselRef.current) {
        setWidth(carouselRef.current.scrollWidth - carouselRef.current.offsetWidth);
      }
    };
    updateWidth();
    // Use a small timeout to ensure DOM is updated
    const timer = setTimeout(updateWidth, 100);
    window.addEventListener('resize', updateWidth);
    return () => {
      window.removeEventListener('resize', updateWidth);
      clearTimeout(timer);
    };
  }, [products, loading, layout, columns, mobileColumns]);

  const slideLeft = () => {
    const current = x.get();
    const newPos = Math.min(current + (carouselRef.current?.offsetWidth || 400), 0);
    animate(x, newPos, { type: "spring", stiffness: 300, damping: 30 });
  };

  const slideRight = () => {
    const current = x.get();
    const newPos = Math.max(current - (carouselRef.current?.offsetWidth || 400), -width);
    animate(x, newPos, { type: "spring", stiffness: 300, damping: 30 });
  };

  const cardRadiusClass = styles?.cardRadius === 'small' ? 'rounded-lg' :
    styles?.cardRadius === 'large' ? 'rounded-[2rem]' :
      styles?.cardRadius === 'none' ? 'rounded-none' : 'rounded-2xl';

  const isSlider = true;

  return (
    <div className={`w-full overflow-hidden py-10 sm:py-16 ${uid}`}>
      <style>{`
        .${uid} .carousel-item {
          width: calc(${100 / mobileColumns}% - ${(16 * (mobileColumns - 1)) / mobileColumns}px);
        }
        @media (min-width: 768px) {
          .${uid} .carousel-item {
            width: calc(${100 / columns}% - ${(24 * (columns - 1)) / columns}px);
          }
        }
      `}</style>

      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6 sm:mb-10 lg:gap-10">
          <div className="flex-1 min-w-0">
            <SectionHeader
              title={headline}
              styles={styles}
              noMargin
              noPadding
              className="!mb-0"
            />
          </div>

          {/* Navigation Controls */}
          {products.length > 0 && (
            <div className="flex gap-2 sm:gap-3 shrink-0">
              <button
                onClick={slideLeft}
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl border flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 group shadow-sm bg-white/10"
                style={{
                  borderColor: styles?.borderColor || 'rgba(0,0,0,0.1)',
                  color: styles?.headlineColor || styles?.color || 'inherit'
                }}
                aria-label="Previous products"
              >
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
              </button>
              <button
                onClick={slideRight}
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 group shadow-lg"
                style={{
                  backgroundColor: styles?.buttonColor || '#000',
                  color: styles?.buttonTextColor || '#fff'
                }}
                aria-label="Next products"
              >
                <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex gap-4 sm:gap-6 overflow-hidden">
            {[...Array(columns)].map((_, i) => (
              <div key={i} className="carousel-item shrink-0 animate-pulse">
                <div className={`aspect-[4/5] bg-slate-200 dark:bg-slate-800 ${cardRadiusClass} mb-4`} />
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2 mb-2" />
                <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-1/4" />
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <motion.div ref={carouselRef} className="cursor-grab active:cursor-grabbing">
            <motion.div
              drag="x"
              dragConstraints={{ right: 0, left: -width }}
              dragElastic={0.1}
              whileTap={{ cursor: "grabbing" }}
              style={{ x }}
              className="flex gap-4 sm:gap-6"
            >
              {products.map((product) => (
                <motion.div key={product.id} className="carousel-item shrink-0 pb-4">
                  <ProductCard 
                    product={product} 
                    cardRadius={styles?.cardRadius}
                  />
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        ) : (
          <div className={`py-20 text-center text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-800 ${cardRadiusClass}`}>
            <p className="max-w-xs mx-auto text-sm font-medium">
              {source === 'collection' && collectionId
                ? "No products found in this collection."
                : source === 'manual'
                  ? "No products selected. Select products in the customizer settings."
                  : "No products found. Add some products in the admin dashboard."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
