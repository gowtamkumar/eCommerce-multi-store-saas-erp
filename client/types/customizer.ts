/**
 * Shopify-like Customizer Type Definitions
 */

export type SectionType =
  | 'section'     // Structural Node
  | 'row'         // Structural Node
  | 'column'      // Structural Node
  | 'banner'
  | 'product-slider'
  | 'category-grid'
  | 'offer-banner'
  | 'review-slider'
  | 'text-block'
  | 'image-block'
  | 'button'
  | 'faq-section'
  | 'brand-grid'
  | 'newsletter'
  | 'stats-counter'
  | 'video-block'
  | 'contact'
  | 'new-arrivals'
  | 'heading'
  | 'paragraph'
  | 'divider'
  | 'spacer'
  | 'checkout';

export interface SectionStyles {
  paddingTop?: number | string;
  paddingBottom?: number | string;
  mobilePaddingTop?: number | string;
  mobilePaddingBottom?: number | string;
  backgroundColor?: string;
  textColor?: string;
  color?: string;
  height?: number | string;
  overlayOpacity?: number;
  textAlign?: string;
  headlineColor?: string;
  titleColor?: string;
  sublineColor?: string;
  buttonColor?: string;
  buttonTextColor?: string;
  iconColor?: string;
  iconBgColor?: string;
  iconBorder?: string;
  // Image Styles
  imageRadius?: string;
  imageBorder?: string;
  imageShadow?: string;
  // Card Styles
  cardRadius?: string;
  cardBorder?: string;
  cardShadow?: string;
  cardBackgroundColor?: string;
  borderColor?: string;
  // Typography - General
  fontFamily?: string;
  fontStyle?: 'normal' | 'italic' | string;
  fontWeight?: string | number;
  fontSize?: string | number;
  lineHeight?: string | number;
  // Typography - Headings
  headingFontFamily?: string;
  headingFontWeight?: string | number;
  headingFontSize?: string | number;
  headingLineHeight?: string | number;
  // Typography - Paragraphs
  paragraphFontFamily?: string;
  paragraphFontWeight?: string | number;
  paragraphFontSize?: string | number;
  paragraphLineHeight?: string | number;
}

// --- Specific Section Settings ---

export interface BannerSettings {
  headline?: string;
  subline?: string;
  backgroundImage?: string;
  primaryButtonText?: string;
  primaryButtonLink?: string;
  secondaryButtonText?: string;
  secondaryButtonLink?: string;
  overlayOpacity?: number;
}

export interface NewArrivalsSettings {
  headline?: string;
  source?: 'all' | 'collection' | 'manual';
  collectionId?: string;
  productIds?: string[];
  count?: number;
  columns?: number;
  mobileColumns?: number;
}

export interface ProductSliderSettings {
  headline?: string;
  source?: 'all' | 'collection' | 'manual';
  collectionId?: string;
  productIds?: string[];
  count?: number;
  layout?: 'slider' | 'grid';
  columns?: number;
  autoplay?: boolean;
}

export interface CategoryItem {
  id: string;
  label: string;
  image?: string;
  link?: string;
}

export interface CategoryGridSettings {
  title?: string;
  source?: 'all' | 'manual';
  count?: number;
  columns?: number;
  items?: CategoryItem[];
}

export interface BrandGridSettings {
  title?: string;
  source?: 'all' | 'manual';
  count?: number;
  columns?: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  items?: any[];
}

export interface NewsletterSettings {
  title?: string;
  description?: string;
  buttonText?: string;
  placeholder?: string;
}

export interface StatItem {
  id: string;
  label: string;
  value: string;
}

export interface StatsCounterSettings {
  items: StatItem[];
}

export interface OfferBannerSettings {
  headline?: string;
  subline?: string;
  image?: string;
  backgroundImage?: string;
  layout?: 'left' | 'right';
  buttonText?: string;
  buttonLink?: string;
  secondaryButtonText?: string;
  secondaryButtonLink?: string;
  backgroundColor?: string;
  endDate?: string; // For countdown
}

export interface ReviewItem {
  id: string;
  author: string;
  text: string;
  rating: number;
  avatar?: string;
}

export interface ReviewSliderSettings {
  title?: string;
  source?: 'manual' | 'all' | 'selection';
  count?: number;
  layout?: 'slider' | 'grid';
  columns?: number;
  reviews?: ReviewItem[];
  reviewIds?: string[];
}

export interface TextBlockSettings {
  headline?: string;
  html?: string;
  alignment?: 'left' | 'center' | 'right';
}

export interface ImageBlockSettings {
  image?: string;
}

export interface VideoBlockSettings {
  headline?: string;
  videoUrl?: string;
  autoplay?: boolean;
  loop?: boolean;
  muted?: boolean;
  controls?: boolean;
  fullWidth?: boolean;
  aspectRatio?: '16/9' | '4/3' | '1/1';
}

export interface ButtonSettings {
  text?: string;
  link?: string;
  variant?: 'solid' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export interface FAQSectionSettings {
  title?: string;
  items: FAQItem[];
}

export interface HeadingSettings {
  text?: string;
  level?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  alignment?: 'left' | 'center' | 'right';
}

export interface ParagraphSettings {
  content?: string;
  alignment?: 'left' | 'center' | 'right';
}

export interface DividerSettings {
  thickness?: number;
  width?: string;
  color?: string;
  style?: 'solid' | 'dashed' | 'dotted';
}

export interface SpacerSettings {
  height?: number;
}

export interface ContactSectionSettings {
  title?: string;
  subline?: string;
  showMap?: boolean;
  showForm?: boolean;
  showInfo?: boolean;
  cardLayout?: 'left' | 'right' | 'center';
  email?: string;
  phone?: string;
  address?: string;
}

export interface CheckoutSettings {
  productId?: string;
  title?: string;
  buttonText?: string;
  showProductSummary?: boolean;
}

export type SectionSettings =
  | BannerSettings
  | ProductSliderSettings
  | CategoryGridSettings
  | OfferBannerSettings
  | ReviewSliderSettings
  | TextBlockSettings
  | ImageBlockSettings
  | ButtonSettings
  | FAQSectionSettings
  | BrandGridSettings
  | NewsletterSettings
  | StatsCounterSettings
  | VideoBlockSettings
  | ContactSectionSettings
  | DividerSettings
  | SpacerSettings
  | CheckoutSettings
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  | Record<string, any>;

export type ViewportBreakpoint = 'desktop' | 'tablet' | 'mobile';

export interface CustomizerSection {
  id: string;
  type: SectionType;
  settings: SectionSettings;
  styles?: SectionStyles;
  /**
   * Per-breakpoint visibility. Use this when the block should appear at some
   * widths but not others (e.g. "show on desktop only"). Missing keys default
   * to `true` so existing data keeps rendering.
   */
  visibility?: {
    desktop: boolean;
    tablet?: boolean;
    mobile: boolean;
  };
  /**
   * Universal soft-hide. When `true` the block is skipped on the storefront
   * and rendered dimmed in the editor. Use this for "draft" blocks the user
   * wants to keep but not publish yet.
   */
  hidden?: boolean;
  /** Prevents accidental edits; toggled from the canvas toolbar. */
  locked?: boolean;
  /** Optional human-readable label shown in the layers tree. */
  name?: string;
  children?: CustomizerSection[];
}

export interface CustomizerData {
  sections: CustomizerSection[];
}

export const defaultSectionStyles: SectionStyles = {
  paddingTop: 40,
  paddingBottom: 40,
};

export interface PageData {
  id?: string;
  title: string;
  slug: string;
  isHomePage: boolean;
  status: 'draft' | 'published';
  content: CustomizerData;
  metaTitle?: string;
  metaDescription?: string;
  ogImage?: string;
  publishAt?: string | null;
  typography?: {
    fontFamily: string;
    headingFont: string;
    baseFontSize: number;
    headingFontFamily?: string;
    headingFontWeight?: string;
    headingFontSize?: string;
    headingLineHeight?: string;
    paragraphFontFamily?: string;
    paragraphFontWeight?: string;
    paragraphFontSize?: string;
    paragraphLineHeight?: string;
  };
}

/** Tenant-wide design tokens used by storefront and editor. */
export interface ThemeTokens {
  colors?: {
    brand?: string;
    accent?: string;
    background?: string;
    foreground?: string;
    muted?: string;
    border?: string;
    success?: string;
    danger?: string;
  };
  fonts?: {
    body?: string;
    heading?: string;
  };
  radii?: {
    sm?: string;
    md?: string;
    lg?: string;
  };
  spacing?: {
    sm?: string;
    md?: string;
    lg?: string;
  };
  shadows?: {
    sm?: string;
    md?: string;
    lg?: string;
  };
}
