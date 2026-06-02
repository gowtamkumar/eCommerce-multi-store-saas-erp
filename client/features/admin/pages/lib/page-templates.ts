import { CustomizerSection, SectionType } from '@/types/customizer';
import { createBlock } from '@/features/admin/pages/components/customizer/blocks';

export interface PageTemplate {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  category: 'Landing' | 'Storefront' | 'Marketing' | 'Blank';
  build(): CustomizerSection[];
}

interface BlockOverride {
  type: SectionType;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  settings?: Record<string, any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  styles?: Record<string, any>;
}

/**
 * Build a section using the registry defaults, then shallow-merge any template
 * specific overrides on top. Keeps templates lean and DRY.
 */
function block({ type, settings, styles }: BlockOverride): CustomizerSection {
  const base = createBlock(type);
  return {
    ...base,
    settings: { ...(base.settings || {}), ...(settings || {}) },
    styles: { ...(base.styles || {}), ...(styles || {}) },
  };
}

export const PAGE_TEMPLATES: PageTemplate[] = [
  {
    id: 'blank',
    name: 'Blank',
    description: 'Start from an empty canvas.',
    thumbnail: '',
    category: 'Blank',
    build() {
      return [];
    },
  },
  {
    id: 'hero-features',
    name: 'Hero + Features',
    description: 'Hero banner, three highlights, and a newsletter signup.',
    thumbnail: '',
    category: 'Landing',
    build() {
      return [
        block({
          type: 'banner',
          settings: {
            slides: [
              {
                id: `slide-${Date.now()}`,
                headline: 'Build your next launch fast',
                subline: 'Drag, drop, publish. No code required.',
                backgroundImage:
                  'https://images.unsplash.com/photo-1494256997604-768d1f608cac?q=80&w=2070&auto=format&fit=crop',
                primaryButtonText: 'Get started',
                primaryButtonLink: '/products',
                secondaryButtonText: 'Learn more',
                secondaryButtonLink: '/about',
              },
            ],
          },
          styles: { height: 540, overlayOpacity: 35 },
        }),
        block({ type: 'stats-counter' }),
        block({ type: 'newsletter' }),
      ];
    },
  },
  {
    id: 'storefront-home',
    name: 'Storefront Home',
    description: 'Hero, category grid, product slider, reviews.',
    thumbnail: '',
    category: 'Storefront',
    build() {
      return [
        block({
          type: 'banner',
          settings: {
            slides: [
              {
                id: `slide-${Date.now()}`,
                headline: 'New season, new arrivals',
                subline: 'Shop the latest collection',
                backgroundImage:
                  'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070&auto=format&fit=crop',
                primaryButtonText: 'Shop now',
                primaryButtonLink: '/products',
              },
            ],
          },
          styles: { height: 480, overlayOpacity: 25 },
        }),
        block({
          type: 'category-grid',
          settings: { title: 'Shop by category', columns: 4, source: 'all', count: 8 },
        }),
        block({
          type: 'product-slider',
          settings: { headline: 'Trending now', source: 'all', count: 8, layout: 'slider', columns: 4 },
        }),
        block({
          type: 'review-slider',
          settings: { title: 'Loved by customers', source: 'all', count: 6, layout: 'slider' },
        }),
      ];
    },
  },
  {
    id: 'product-landing',
    name: 'Product Landing',
    description: 'Hero + offer + FAQ — perfect for a single-product launch.',
    thumbnail: '',
    category: 'Marketing',
    build() {
      return [
        block({
          type: 'banner',
          settings: {
            slides: [
              {
                id: `slide-${Date.now()}`,
                headline: 'Meet the product everyone is talking about',
                subline: 'Limited stock — order yours today.',
                backgroundImage:
                  'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?q=80&w=2070&auto=format&fit=crop',
                primaryButtonText: 'Buy now',
                primaryButtonLink: '/checkout',
              },
            ],
          },
          styles: { height: 560, overlayOpacity: 40 },
        }),
        block({
          type: 'offer-banner',
          settings: {
            headline: 'Save 20% this week',
            subline: 'Auto-applied at checkout.',
            buttonText: 'Claim offer',
            buttonLink: '/products',
          },
        }),
        block({
          type: 'faq-section',
          settings: { title: 'Frequently asked questions', source: 'all' },
        }),
      ];
    },
  },
];
