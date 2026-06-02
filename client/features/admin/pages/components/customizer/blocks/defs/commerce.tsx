"use client";

/**
 * Commerce blocks — product/category/brand grids and the landing checkout.
 *
 * All runtime components in here either depend on storefront commerce data
 * or are heavy (the checkout client form). They're dynamically imported so
 * pages without commerce blocks stay lean.
 */

import dynamic from 'next/dynamic';
import { CreditCard, Grid, Sliders } from 'lucide-react';
import GridEditor from '../../editors/GridEditor';
import InteractiveEditor from '../../editors/InteractiveEditor';
import ProductGridEditor from '../../editors/ProductGridEditor';
import type { BlockDefinition } from '../types';

const ProductSlider = dynamic(() => import('../../runtime/ProductSlider'), { ssr: true });
const NewArrivals = dynamic(() => import('../../runtime/NewArrivals'), { ssr: true });
const CategoryGrid = dynamic(() => import('../../runtime/CategoryGrid'), { ssr: true });
const BrandGrid = dynamic(() => import('@/features/admin/brand/components/BrandSlider'), {
  ssr: true,
});
const LandingCheckout = dynamic(() => import('../../runtime/LandingCheckout'), { ssr: false });

const commerceBlocks: BlockDefinition[] = [
  {
    type: 'product-slider',
    label: 'Product Slider',
    category: 'Commerce',
    icon: Sliders,
    defaultSettings: () => ({ source: 'all', count: 8, layout: 'slider', columns: 4 }),
    defaultStyles: () => ({ paddingTop: 40, paddingBottom: 60 }),
    Runtime: ({ section, settings, styles }) => (
      <ProductSlider
        sectionId={section.id}
        headline={settings?.headline}
        count={settings?.count}
        source={settings?.source}
        productIds={settings?.productIds}
        collectionId={settings?.source === 'collection' ? settings?.collectionId : undefined}
        layout={settings?.layout}
        columns={settings?.columns}
        mobileColumns={settings?.mobileColumns}
        styles={styles}
      />
    ),
    ContentEditor: ({ settings, viewMode, resources, onUpdate }) => (
      <ProductGridEditor
        settings={settings}
        viewMode={viewMode}
        products={resources.products}
        categories={resources.categories}
        onUpdate={onUpdate}
      />
    ),
  },
  {
    type: 'new-arrivals',
    label: 'New Arrivals',
    category: 'Commerce',
    icon: Grid,
    defaultSettings: () => ({ source: 'all', count: 8, columns: 4 }),
    defaultStyles: () => ({ paddingTop: 40, paddingBottom: 60 }),
    Runtime: ({ section, settings, styles }) => (
      <NewArrivals
        sectionId={section.id}
        headline={settings?.headline}
        count={settings?.count}
        source={settings?.source}
        productIds={settings?.productIds}
        collectionId={settings?.source === 'collection' ? settings?.collectionId : undefined}
        columns={settings?.columns}
        mobileColumns={settings?.mobileColumns}
        styles={styles}
      />
    ),
    ContentEditor: ({ settings, viewMode, resources, onUpdate }) => (
      <ProductGridEditor
        settings={settings}
        viewMode={viewMode}
        products={resources.products}
        categories={resources.categories}
        onUpdate={onUpdate}
      />
    ),
  },
  {
    type: 'category-grid',
    label: 'Category Grid',
    category: 'Commerce',
    icon: Grid,
    defaultSettings: () => ({ source: 'all', count: 8, columns: 4 }),
    defaultStyles: () => ({ paddingTop: 60, paddingBottom: 60 }),
    Runtime: ({ section, settings, styles }) => (
      <CategoryGrid
        sectionId={section.id}
        title={settings?.title}
        count={settings?.count}
        source={settings?.source}
        items={settings?.items}
        columns={settings?.columns}
        mobileColumns={settings?.mobileColumns}
        styles={styles}
      />
    ),
    ContentEditor: ({
      section,
      viewMode,
      resources,
      onUpdate,
      updateArrayItem,
      addArrayItem,
      removeArrayItem,
    }) => (
      <GridEditor
        section={section}
        categories={resources.categories}
        brands={resources.brands}
        viewMode={viewMode}
        onUpdate={onUpdate}
        updateArrayItem={updateArrayItem}
        addArrayItem={addArrayItem}
        removeArrayItem={removeArrayItem}
      />
    ),
  },
  {
    type: 'brand-grid',
    label: 'Brand Grid',
    category: 'Commerce',
    icon: Grid,
    defaultSettings: () => ({ source: 'all', count: 8, columns: 4 }),
    defaultStyles: () => ({ paddingTop: 60, paddingBottom: 60 }),
    Runtime: ({ section, settings, styles }) => (
      <BrandGrid
        sectionId={section.id}
        title={settings?.title}
        count={settings?.count}
        source={settings?.source}
        items={settings?.items}
        columns={settings?.columns}
        mobileColumns={settings?.mobileColumns}
        styles={styles}
        layout={settings?.layout}
      />
    ),
    ContentEditor: ({
      section,
      viewMode,
      resources,
      onUpdate,
      updateArrayItem,
      addArrayItem,
      removeArrayItem,
    }) => (
      <GridEditor
        section={section}
        categories={resources.categories}
        brands={resources.brands}
        viewMode={viewMode}
        onUpdate={onUpdate}
        updateArrayItem={updateArrayItem}
        addArrayItem={addArrayItem}
        removeArrayItem={removeArrayItem}
      />
    ),
  },
  {
    type: 'checkout',
    label: 'Checkout',
    category: 'Commerce',
    icon: CreditCard,
    defaultStyles: () => ({ paddingTop: 40, paddingBottom: 40 }),
    Runtime: ({ settings, styles }) => <LandingCheckout settings={settings} styles={styles} />,
    ContentEditor: ({ section, onUpdate, updateArrayItem, addArrayItem, removeArrayItem }) => (
      <InteractiveEditor
        section={section}
        onUpdate={onUpdate}
        updateArrayItem={updateArrayItem}
        addArrayItem={addArrayItem}
        removeArrayItem={removeArrayItem}
      />
    ),
  },
];

export default commerceBlocks;
