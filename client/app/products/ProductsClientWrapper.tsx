'use client';

import ProductFilters from '@/components/store/ProductFilters';
import ProductList from '@/components/store/ProductList';
import { useState } from 'react';

interface ProductsClientWrapperProps {
  categories: any[];
  brands: any[];
  products: any[];
  total: number;
}

export default function ProductsClientWrapper({ categories, brands, products, total }: ProductsClientWrapperProps) {
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  return (
    <div className="flex flex-col md:flex-row gap-8 items-start">
      {/* Sidebar Filters */}
      <ProductFilters
        categories={categories}
        brands={brands}
        isMobileOpen={isMobileFiltersOpen}
        onCloseMobile={() => setIsMobileFiltersOpen(false)}
      />

      {/* Product Grid */}
      <div className="flex-1 w-full min-w-0">
        <ProductList
          products={products}
          total={total}
          onOpenMobileFilters={() => setIsMobileFiltersOpen(true)}
        />
      </div>
    </div>
  );
}
