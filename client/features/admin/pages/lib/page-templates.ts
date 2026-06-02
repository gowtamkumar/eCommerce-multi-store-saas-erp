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
    name: 'Blank Canvas',
    description: 'Start fresh with an empty layout and fully custom controls.',
    thumbnail: '',
    category: 'Blank',
    build() {
      return [];
    },
  },
  {
    id: 'hero-features',
    name: 'Hero + Features',
    description: 'Conversion-driven landing layout featuring headlines, features list, and a newsletter.',
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
    id: 'fashion-boutique',
    name: 'Fashion Boutique Storefront',
    description: 'Beautiful storefront for clothing & brands. Grid layout, sliding products, and collections.',
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
                headline: 'Sleek Fashion Collection',
                subline: 'Crafted for absolute comfort, styled uniquely for you.',
                backgroundImage:
                  'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070&auto=format&fit=crop',
                primaryButtonText: 'View Arrivals',
                primaryButtonLink: '/products',
              },
            ],
          },
          styles: { height: 500, overlayOpacity: 30 },
        }),
        block({
          type: 'category-grid',
          settings: { title: 'Discover Collections', columns: 4, source: 'all', count: 4 },
        }),
        block({
          type: 'product-slider',
          settings: { headline: 'Trending Outfits', source: 'all', count: 8, layout: 'slider', columns: 4 },
        }),
        block({
          type: 'brand-grid',
          settings: { title: 'Our Featured Collaborators', columns: 6 },
        }),
        block({
          type: 'review-slider',
          settings: { title: 'What Our Clients Say', source: 'all', count: 6, layout: 'slider' },
        }),
      ];
    },
  },
  {
    id: 'tech-hub',
    name: 'Tech & Electronics Hub',
    description: 'Sleek, product-focused storefront for gadgets, smart gear, and online hardware.',
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
                headline: 'Innovative Tech, Delivered',
                subline: 'Save up to 30% off on award-winning smart home ecosystem systems.',
                backgroundImage:
                  'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2070&auto=format&fit=crop',
                primaryButtonText: 'Explore Deals',
                primaryButtonLink: '/products',
              },
            ],
          },
          styles: { height: 480, overlayOpacity: 45 },
        }),
        block({
          type: 'stats-counter',
          settings: {
            title: 'Global High-Tech Solutions',
            stats: [
              { label: 'Smart Devices', value: '450+' },
              { label: 'Active Retailers', value: '25k' },
              { label: 'Fast Delivery', value: '24h' },
            ]
          }
        }),
        block({
          type: 'product-slider',
          settings: { headline: 'Featured Gadgets', source: 'all', count: 6, layout: 'slider', columns: 3 },
        }),
        block({
          type: 'offer-banner',
          settings: {
            headline: 'Weekend Flash Offer',
            subline: 'Get free premium earphones with every smartphone purchase.',
            buttonText: 'Order Now',
            buttonLink: '/checkout',
          },
        }),
      ];
    },
  },
  {
    id: 'saas-conversion',
    name: 'SaaS Operations & Pitch',
    description: 'High-impact product landing page tailored to SaaS platforms, app promotions, and conversions.',
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
                headline: 'Scale Your Retail Operations',
                subline: 'Unified commerce system with AI recommendations.',
                backgroundImage:
                  'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2015&auto=format&fit=crop',
                primaryButtonText: 'Start Free Trial',
                primaryButtonLink: '/auth/register',
                secondaryButtonText: 'Book a Demo',
                secondaryButtonLink: '/contact',
              },
            ],
          },
          styles: { height: 520, overlayOpacity: 50 },
        }),
        block({
          type: 'stats-counter',
          settings: {
            title: 'Trusted Globally',
            stats: [
              { label: 'Uptime SLA', value: '99.99%' },
              { label: 'Volume Processed', value: '$2.5B+' },
              { label: 'Security Grade', value: 'SOC2' },
            ]
          }
        }),
        block({
          type: 'review-slider',
          settings: { title: 'Scale Stories from Real Enterprise Partners', source: 'all', count: 6, layout: 'slider' },
        }),
        block({
          type: 'offer-banner',
          settings: {
            headline: 'Flexible pricing models tailored to you.',
            subline: 'Start completely free. Upgrade when your business grows.',
            buttonText: 'View Pricing plans',
            buttonLink: '/pricing',
          },
        }),
        block({ type: 'newsletter' }),
      ];
    },
  },
  {
    id: 'faq-support',
    name: 'Customer Support Center',
    description: 'Beautiful, organized layout for FAQs, help centers, and contact support forms.',
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
                headline: 'How can we help you today?',
                subline: 'Search our detailed knowledge base or contact our live agents.',
                backgroundImage:
                  'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?q=80&w=2072&auto=format&fit=crop',
                primaryButtonText: 'Open a Ticket',
                primaryButtonLink: '/support/ticket',
              },
            ],
          },
          styles: { height: 420, overlayOpacity: 40 },
        }),
        block({
          type: 'stats-counter',
          settings: {
            title: 'Reliable Support Statistics',
            stats: [
              { label: 'Customer Satisfaction', value: '98.4%' },
              { label: 'Average Response', value: '< 15m' },
              { label: 'Knowledge Base', value: '500+' },
            ]
          }
        }),
        block({
          type: 'faq-section',
          settings: { title: 'Frequently Asked Questions', source: 'all' },
        }),
        block({
          type: 'contact',
          settings: {
            title: 'Still have questions?',
            description: 'Fill out our secure contact form and our support staff will email you back shortly.',
            email: 'support@example.com',
            phone: '+1 (800) 555-0199',
            address: '100 Innovation Way, Suite 400, Tech City',
          }
        }),
      ];
    },
  },
  {
    id: 'brand-showcase',
    name: 'Brand Showcase Landing',
    description: 'Media-heavy layout built to tell a rich product/brand story with video previews.',
    thumbnail: '',
    category: 'Marketing',
    build() {
      return [
        block({
          type: 'video-block',
          settings: {
            videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-fashion-woman-with-silver-makeup-40275-large.mp4',
            autoPlay: true,
            muted: true,
            loop: true,
          },
          styles: { height: 500 }
        }),
        block({
          type: 'offer-banner',
          settings: {
            headline: 'The Next Generation of Fashion Tech',
            subline: 'See the detailed report on eco-friendly textiles.',
            buttonText: 'Read Full Report',
            buttonLink: '/eco-report',
          },
        }),
        block({
          type: 'brand-grid',
          settings: { title: 'Featured Partnerships & Press Highlights', columns: 4 },
        }),
        block({ type: 'divider' }),
        block({ type: 'newsletter' }),
      ];
    },
  },
  {
    id: 'organic-grocery',
    name: 'Organic Grocery Market',
    description: 'Vibrant storefront for fresh produce, organic food, and daily supermarket essentials.',
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
                headline: 'Fresh & Organic Groceries',
                subline: '100% certified organic foods delivered straight to your doorstep.',
                backgroundImage:
                  'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=2074&auto=format&fit=crop',
                primaryButtonText: 'Shop Fresh Produce',
                primaryButtonLink: '/products',
              },
            ],
          },
          styles: { height: 460, overlayOpacity: 25 },
        }),
        block({
          type: 'category-grid',
          settings: { title: 'Shop by Department', columns: 4, source: 'all', count: 4 },
        }),
        block({
          type: 'product-slider',
          settings: { headline: 'Weekly Fresh Deals', source: 'all', count: 8, layout: 'slider', columns: 4 },
        }),
        block({
          type: 'stats-counter',
          settings: {
            title: 'Our Clean Food Promise',
            stats: [
              { label: 'Organic Farms', value: '100%' },
              { label: 'Local Growers', value: '80+' },
              { label: 'Same Day Delivery', value: '< 2h' },
            ]
          }
        }),
        block({
          type: 'offer-banner',
          settings: {
            headline: 'Get 15% Off Your First Basket',
            subline: 'Use code FRESH15 at check out. Free delivery included.',
            buttonText: 'Claim Discount',
            buttonLink: '/products',
          },
        }),
      ];
    },
  },
  {
    id: 'luxury-jewelry',
    name: 'Luxury Jewelry & Atelier',
    description: 'Elegant, premium dark storefront showcasing high-end jewelry, watches, and precious accessories.',
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
                headline: 'Crafted Timeless Elegance',
                subline: 'Discover the newly launched exquisite atelier diamond collection.',
                backgroundImage:
                  'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=2070&auto=format&fit=crop',
                primaryButtonText: 'Explore Atelier',
                primaryButtonLink: '/products',
              },
            ],
          },
          styles: { height: 500, overlayOpacity: 35 },
        }),
        block({
          type: 'brand-grid',
          settings: { title: 'World Renowned Jewelry Artisans', columns: 4 },
        }),
        block({
          type: 'product-slider',
          settings: { headline: 'The Signature Diamond Collection', source: 'all', count: 6, layout: 'slider', columns: 3 },
        }),
        block({
          type: 'review-slider',
          settings: { title: 'Client Appreciations & Valuations', source: 'all', count: 6, layout: 'slider' },
        }),
        block({
          type: 'newsletter',
          settings: {
            title: 'Subscribe to the Atelier Newsletter',
            description: 'Receive VIP early entry invites to exclusive designs and private seasonal collections.',
          }
        }),
      ];
    },
  },
  {
    id: 'sports-fitness',
    name: 'Sports & Activewear Hub',
    description: 'Dynamic, high-energy layout designed for athletic apparel, shoes, and workout equipment.',
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
                headline: 'Unleash Your Active Potential',
                subline: 'Engineered for high performance. Designed for perfect comfort.',
                backgroundImage:
                  'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=2070&auto=format&fit=crop',
                primaryButtonText: 'Shop New Apparel',
                primaryButtonLink: '/products',
              },
            ],
          },
          styles: { height: 480, overlayOpacity: 40 },
        }),
        block({
          type: 'category-grid',
          settings: { title: 'Explore Training Gear', columns: 4, source: 'all', count: 4 },
        }),
        block({
          type: 'product-slider',
          settings: { headline: 'Best Selling Training Gear', source: 'all', count: 8, layout: 'slider', columns: 4 },
        }),
        block({
          type: 'offer-banner',
          settings: {
            headline: 'Join the Performance Athletic Club',
            subline: 'Become a member and instantly receive 15% off your next purchase.',
            buttonText: 'Join the Club',
            buttonLink: '/auth/register',
          },
        }),
        block({ type: 'newsletter' }),
      ];
    },
  },
];

