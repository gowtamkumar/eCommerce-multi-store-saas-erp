"use client";

import { fetchAPI } from "@/services/api";
import { Plus } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

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
    // Map manual items (using link as categoryId) to real category data
    const selectedIds = items.map(item => item.link).filter(Boolean);
    displayedCategories = selectedIds
      .map(id => categories.find(c => c.id === id))
      .filter(Boolean);
  } else {
    // Automatic selection
    displayedCategories = categories.slice(0, count);
  }

  const cardRadiusClass = styles?.cardRadius === 'small' ? 'rounded-lg' :
    styles?.cardRadius === 'large' ? 'rounded-[2rem]' :
      styles?.cardRadius === 'full' ? 'rounded-full' :
        styles?.cardRadius === 'none' ? 'rounded-none' : 'rounded-2xl';

  return (
    <div className="w-full">
      <div className="w-full">
        {title && (
          <div className={`mb-12 space-y-4
            ${styles?.textAlign === 'center' ? 'text-center' : ''}
            ${styles?.textAlign === 'right' ? 'text-right' : ''}
            ${!styles?.textAlign || styles?.textAlign === 'left' ? 'text-left' : ''}
          `}>
            <h2
              className="text-3xl md:text-5xl font-black tracking-tighter uppercase"
              style={{ color: styles?.headlineColor || styles?.color }}
            >
              {title}
            </h2>
            <div
              className={`w-16 h-1 rounded-full
                ${styles?.textAlign === 'center' ? 'mx-auto' : ''}
                ${styles?.textAlign === 'right' ? 'ml-auto' : ''}
                ${!styles?.textAlign || styles?.textAlign === 'left' ? 'mr-auto' : ''}
              `}
              style={{ backgroundColor: styles?.sublineColor || styles?.headlineColor || styles?.color || '#4f46e5' }}
            />
          </div>
        )}

        <style>{`
          @media (min-width: 768px) {
            .category-grid-${sectionId || 'default'} {
              grid-template-columns: repeat(var(--md-cols, ${columns}), minmax(0, 1fr)) !important;
            }
          }
        `}</style>

        {loading ? (
          <div
            className={`grid gap-6 category-grid-${sectionId || 'default'}`}
            style={{
              gridTemplateColumns: `repeat(${mobileColumns}, minmax(0, 1fr))`,
              '--md-cols': columns
            } as any}
          >
            {[...Array(count)].map((_, i) => (
              <div key={i} className={`aspect-[4/5] bg-slate-200 dark:bg-slate-800 ${cardRadiusClass} animate-pulse`} />
            ))}
          </div>
        ) : displayedCategories.length > 0 ? (
          <div
            className={`grid gap-6 category-grid-${sectionId || 'default'}`}
            style={{
              gridTemplateColumns: `repeat(${mobileColumns}, minmax(0, 1fr))`,
              '--md-cols': columns
            } as any}
          >
            {displayedCategories.map((category) => (
              <Link
                key={category.id}
                href={`/products?categoryId=${category.id}`}
                className={`relative aspect-[4/5] bg-slate-100 dark:bg-slate-800 flex flex-col items-center justify-center group overflow-hidden transition-all hover:-translate-y-2 ${cardRadiusClass}
                  ${styles?.cardBorder === 'thin' ? 'border border-slate-200 dark:border-slate-700' : ''}
                  ${styles?.cardBorder === 'medium' ? 'border-2 border-slate-200 dark:border-slate-700' : ''}
                  ${styles?.cardBorder === 'thick' ? 'border-4 border-slate-200 dark:border-slate-700' : ''}
                  ${styles?.cardShadow === 'small' ? 'shadow-lg' : ''}
                  ${styles?.cardShadow === 'medium' ? 'shadow-xl' : ''}
                  ${styles?.cardShadow === 'large' ? 'shadow-2xl' : ''}
                `}
              >
                {category.image ? (
                  <img src={category.image} alt={category.name} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-1000">
                    <span className="text-8xl opacity-30 group-hover:opacity-100 transition-opacity">📦</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-6 md:p-8">
                  <h3 className="text-2xl md:text-3xl font-black mb-2 uppercase tracking-tight text-white">{category.name}</h3>
                  <span className={`text-xs font-bold uppercase tracking-[0.2em] hover:text-brand-400 transition-colors text-white flex items-center gap-2 ${styles?.textAlign === 'center' ? 'justify-center' : styles?.textAlign === 'right' ? 'justify-end' : 'justify-start'}`}>
                    Shop Collection <Plus className="w-4 h-4" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className={`col-span-full py-16 text-center text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-800 ${cardRadiusClass}`}>
            No categories available.
          </div>
        )}
      </div>
    </div>
  );
}
