"use client";

import { fetchAPI } from "@/services/api";
import { Plus } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface CategoryGridProps {
  title?: string;
  count?: number;
  source?: 'all' | 'manual';
  items?: any[];
  columns?: number;
  styles?: any;
}

export default function CategoryGrid({
  title,
  count = 6,
  source = 'all',
  items = [],
  columns = 3,
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

  return (
    <section
      style={{
        ...styles, // Spread ALL styles including CSS custom properties
        paddingTop: styles?.paddingTop,
        paddingBottom: styles?.paddingBottom,
        backgroundColor: styles?.backgroundColor,
        color: styles?.color
      }}
      className={`px-4 md:px-10 ${!styles?.paddingTop && !styles?.paddingBottom ? 'py-16 md:py-24' : ''}`}
    >
      <div className="max-w-7xl mx-auto">
        <div className={`mb-16 space-y-4
          ${styles?.textAlign === 'center' ? 'text-center' : ''}
          ${styles?.textAlign === 'right' ? 'text-right' : ''}
          ${!styles?.textAlign || styles?.textAlign === 'left' ? 'text-left' : ''}
        `}>
          <h2
            className="text-4xl md:text-5xl font-black tracking-tighter uppercase"
            style={{ color: styles?.headlineColor || styles?.color }}
          >
            {title || 'Explore Collections'}
          </h2>
          <div
            className={`w-24 h-1.5 rounded-full
              ${styles?.textAlign === 'center' ? 'mx-auto' : ''}
              ${styles?.textAlign === 'right' ? 'ml-auto' : ''}
              ${!styles?.textAlign || styles?.textAlign === 'left' ? 'mr-auto' : ''}
            `}
            style={{ backgroundColor: styles?.sublineColor || styles?.headlineColor || styles?.color || '#4f46e5' }}
          />
        </div>

        {loading ? (
          <div className={`grid gap-8 grid-cols-1 sm:grid-cols-2 ${columns === 2 ? 'md:grid-cols-2' : columns === 4 ? 'md:grid-cols-4' : 'md:grid-cols-3'}`}>
            {[...Array(count)].map((_, i) => (
              <div key={i} className="aspect-[4/5] bg-slate-200 dark:bg-slate-800 rounded-[3rem] animate-pulse" />
            ))}
          </div>
        ) : displayedCategories.length > 0 ? (
          <div className={`grid gap-8 grid-cols-1 sm:grid-cols-2 ${columns === 2 ? 'md:grid-cols-2' : columns === 4 ? 'md:grid-cols-4' : 'md:grid-cols-3'}`}>
            {displayedCategories.map((category) => (
              <Link
                key={category.id}
                href={`/products?categoryId=${category.id}`}
                className="relative aspect-[4/5] rounded-[3rem] bg-slate-100 dark:bg-slate-800 flex flex-col items-center justify-center group overflow-hidden border border-slate-200 dark:border-slate-700 transition-all hover:-translate-y-2"
              >
                {category.image ? (
                  <img src={category.image} alt={category.name} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-1000">
                    <span className="text-8xl opacity-30 group-hover:opacity-100 transition-opacity">📦</span>
                  </div>
                )}
                <div className="absolute  inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-10">
                  <h3 className="text-3xl font-black  mb-3 uppercase tracking-tight">{category.name}</h3>
                  <span className={`  text-sm font-bold uppercase tracking-[0.2em] hover:text-brand-400 transition-colors text-left flex items-center gap-2 ${styles?.textAlign === 'center' ? 'justify-center' : styles?.textAlign === 'right' ? 'justify-end' : 'justify-start'}`}>
                    Shop Collection <Plus className="w-4 h-4" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="col-span-full py-16 text-center text-slate-400 border-4 border-dashed border-slate-100 dark:border-slate-800 rounded-[3rem]">
            No categories available. Create categories in the admin dashboard.
          </div>
        )}
      </div>
    </section>
  );
}
