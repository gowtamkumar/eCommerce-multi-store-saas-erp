"use client";

import { AnimatePresence, motion } from "framer-motion";
import { fetchAPI } from "@/services/api";
import { Plus } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import SectionHeader from "./SectionHeader";

interface CategoryGridProps {
  sectionId?: string;
  title?: string;
  count?: number;
  source?: 'all' | 'manual';
  items?: any[];
  columns?: number;
  mobileColumns?: number;
  styles?: any;
}

export default function CategoryGrid({
  sectionId,
  title,
  count = 6,
  source = 'all',
  items = [],
  columns = 3,
  mobileColumns = 2,
  styles
}: CategoryGridProps) {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCategories() {
      setLoading(true);
      try {
        const res = await fetchAPI('/categories');
        // Backend returns data directly in res.data array
        setCategories(Array.isArray(res.data) ? res.data : []);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      } finally {
        setLoading(false);
      }
    }

    loadCategories();
  }, []);

  // Determine which categories to display
  let displayedCategories = [];
  if (source === 'manual' && items.length > 0) {
    const selectedIds = items.map(item => item.link).filter(Boolean);
    displayedCategories = selectedIds
      .map(id => categories.find(c => c.id === id))
      .filter(Boolean);
  } else {
    displayedCategories = categories.slice(0, count);
  }

  const borderRadius = styles?.borderRadius || 0;

  const containerVariants: any = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants: any = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  return (
    <div
      className="w-full transition-all duration-300"
      style={{
        marginTop: styles?.marginTop || 0,
        marginBottom: styles?.marginBottom || 0,
        backgroundColor: styles?.backgroundColor || 'transparent',
        borderRadius: borderRadius,
        borderWidth: styles?.borderWidth || 0,
        borderColor: styles?.borderColor || 'transparent',
        borderStyle: styles?.borderStyle || 'solid',
        boxShadow: styles?.boxShadow || 'none',
        width: styles?.width || '100%',
        maxWidth: styles?.maxWidth || 'none',
        marginLeft: styles?.textAlign === 'center' ? 'auto' : undefined,
        marginRight: styles?.textAlign === 'center' ? 'auto' : undefined,

        // Robust Clipping
        overflow: 'hidden',
        isolation: 'isolate',
        WebkitMaskImage: '-webkit-radial-gradient(white, black)',
        transform: 'translateZ(0)',
      } as any}
    >
      <div
        className="w-full"
        style={{
          paddingTop: styles?.paddingTop || 0,
          paddingBottom: styles?.paddingBottom || 0,
          paddingLeft: styles?.paddingLeft || 0,
          paddingRight: styles?.paddingRight || 0,
        } as any}
      >
        <SectionHeader title={title} styles={styles} />

        <style>{`
          @media (min-width: 768px) {
            .category-grid-${sectionId || 'default'} {
              grid-template-columns: repeat(var(--md-cols, ${columns}), minmax(0, 1fr)) !important;
            }
          }
        `}</style>

        {loading ? (
          <div
            className={`grid gap-6 px-6 category-grid-${sectionId || 'default'}`}
            style={{
              gridTemplateColumns: `repeat(${mobileColumns}, minmax(0, 1fr))`,
              '--md-cols': columns
            } as any}
          >
            {[...Array(count)].map((_, i) => (
              <div key={i} className={`aspect-[4/5] bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse`} />
            ))}
          </div>
        ) : displayedCategories.length > 0 ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className={`grid gap-6 px-6 category-grid-${sectionId || 'default'}`}
            style={{
              gridTemplateColumns: `repeat(${mobileColumns}, minmax(0, 1fr))`,
              '--md-cols': columns
            } as any}
          >
            {displayedCategories.map((category) => (
              <motion.div key={category.id} variants={itemVariants}>
                <Link
                  href={`/products?categoryId=${category.id}`}
                  className={`relative aspect-[4/5] bg-slate-100 dark:bg-slate-800 flex flex-col items-center justify-center group overflow-hidden transition-all duration-500 rounded-2xl
                    ${styles?.cardShadow !== 'none' ? 'shadow-lg hover:shadow-2xl' : ''}
                  `}
                  style={{
                    borderRadius: styles?.cardRadius || '1rem',
                    border: styles?.cardBorder && styles?.cardBorder !== 'none' ? `${styles.cardBorder === 'thin' ? '1px' : styles.cardBorder === 'medium' ? '2px' : '4px'} solid ${styles?.borderColor || 'rgba(0,0,0,0.1)'}` : undefined,
                  }}
                >
                  {category.image ? (
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-1000">
                      <span className="text-8xl opacity-30 group-hover:opacity-100 transition-opacity">📦</span>
                    </div>
                  )}

                  {/* Premium Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-100 transition-all duration-500" />

                  <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                    <h3 className="text-2xl md:text-3xl font-black mb-2 uppercase tracking-tight text-white drop-shadow-md">
                      {category.name}
                    </h3>
                    <div className="overflow-hidden">
                      <span className={`text-xs font-bold uppercase tracking-[0.2em] text-white/0 group-hover:text-white transition-all duration-500 flex items-center gap-2 transform translate-y-full group-hover:translate-y-0 ${styles?.textAlign === 'center' ? 'justify-center' : styles?.textAlign === 'right' ? 'justify-end' : 'justify-start'}`}>
                        Explore <Plus className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="col-span-full py-16 px-6 text-center text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
            No categories available.
          </div>
        )}
      </div>
    </div>
  );
}
