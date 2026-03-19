"use client";

import { fetchAPI } from "@/services/api";
import { useEffect, useState, useMemo } from "react";
import SectionHeader from "./SectionHeader";
import { motion } from "framer-motion";
import ProductCard from "@/features/admin/product/components/ProductCard";

interface NewArrivalsProps {
  sectionId?: string;
  headline?: string;
  source?: 'all' | 'collection' | 'manual';
  productIds?: string[];
  count?: number;
  collectionId?: string;
  columns?: number;
  mobileColumns?: number;
  styles?: any;
}

export default function NewArrivals({
  sectionId,
  headline = "New Arrivals",
  source = 'all',
  productIds = [],
  count = 8,
  collectionId,
  columns = 4,
  mobileColumns = 2,
  styles
}: NewArrivalsProps) {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const uid = useMemo(() => `na-${Math.random().toString(36).substring(2, 7)}`, []);

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
            .map(id => fetchedProducts.find((p: any) => p.id === id || p._id === id))
            .filter(Boolean);
        } else {
          fetchedProducts = fetchedProducts.slice(0, count);
        }

        setProducts(fetchedProducts);
      } catch (error) {
        console.error("Failed to fetch products for New Arrivals:", error);
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, [count, collectionId, source, JSON.stringify(productIds)]);

  const cardRadiusClass = styles?.cardRadius === 'small' ? 'rounded-lg' :
    styles?.cardRadius === 'large' ? 'rounded-[2rem]' :
      styles?.cardRadius === 'none' ? 'rounded-none' : 'rounded-2xl';

  const containerVariants = {
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
    <div className={`w-full overflow-hidden py-10 sm:py-16 ${uid}`}>
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
        </div>

        {loading ? (
          <div className={`grid gap-4 sm:gap-6`} style={{
            gridTemplateColumns: `repeat(${mobileColumns}, minmax(0, 1fr))`
          } as any}>
            <style>{`
              @media (min-width: 768px) {
                .${uid} .grid-container {
                  grid-template-columns: repeat(${columns}, minmax(0, 1fr)) !important;
                }
              }
            `}</style>
            <div className={`grid-container grid gap-4 sm:gap-6 col-span-full`} style={{
              gridTemplateColumns: `repeat(${mobileColumns}, minmax(0, 1fr))`
            } as any}>
              {[...Array(columns)].map((_, i) => (
                <div key={i} className="shrink-0 animate-pulse">
                  <div className={`aspect-[4/5] bg-slate-200 dark:bg-slate-800 ${cardRadiusClass} mb-4`} />
                  <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2 mb-2" />
                  <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-1/4" />
                </div>
              ))}
            </div>
          </div>
        ) : products.length > 0 ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className={`grid gap-4 sm:gap-6 ${uid}-grid`}
            style={{
              gridTemplateColumns: `repeat(${mobileColumns}, minmax(0, 1fr))`
            } as any}
          >
            <style>{`
              @media (min-width: 768px) {
                .${uid}-grid {
                  grid-template-columns: repeat(${columns}, minmax(0, 1fr)) !important;
                }
              }
            `}</style>
            {products.map((product) => (
              <motion.div key={product.id || product._id} variants={itemVariants} className="pb-4">
                <ProductCard product={product} />
              </motion.div>
            ))}
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
