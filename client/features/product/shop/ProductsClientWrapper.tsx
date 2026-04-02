'use client';

import ProductFilters from '@/features/product/admin/ProductFilters';
import ProductList from '@/features/product/admin/ProductWebList';
import { useState } from 'react';

interface ProductsClientWrapperProps {
  categories: any[];
  brands: any[];
  products: any[];
  total: number;
  filterOptions?: any;
  settings?: any;
}

export default function ProductsClientWrapper({ categories, brands, products, total, filterOptions, settings }: ProductsClientWrapperProps) {
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  return (
    <div className="flex flex-col md:flex-row gap-8 items-start">
      {/* Sidebar Filters */}
      <ProductFilters
        categories={categories}
        brands={brands}
        filterOptions={filterOptions}
        isMobileOpen={isMobileFiltersOpen}
        onCloseMobile={() => setIsMobileFiltersOpen(false)}
        settings={settings}
      />

      {/* Product Grid */}
      <div className="flex-1 w-full min-w-0">
        <ProductList
          products={products}
          total={total}
          onOpenMobileFilters={() => setIsMobileFiltersOpen(true)}
          settings={settings}
        />
      </div>
    </div>
  );
}
