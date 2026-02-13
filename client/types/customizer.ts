/**
 * Shopify-like Customizer Type Definitions
 */

export type SectionType =
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
  | 'contact';

export interface SectionStyles {
  paddingTop: number | string;
  paddingBottom: number | string;
  mobilePaddingTop?: number | string;
  mobilePaddingBottom?: number | string;
  backgroundColor?: string;
  textColor?: string;
  height?: number | string;
  overlayOpacity?: number;
  textAlign?: string;
  headlineColor?: string;
  sublineColor?: string;
  buttonColor?: string;
  buttonTextColor?: string;
  iconColor?: string;
  iconBgColor?: string;
  iconBorder?: string;
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
  headline?: string;
  subline?: string;
  image?: string;
  backgroundImage?: string;
  layout?: 'left' | 'right';
  buttonText?: string;
  buttonLink?: string;
  secondaryButtonText?: string;
  secondaryButtonLink?: string;
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
  | Record<string, any>;

export interface CustomizerSection {
  id: string;
  type: SectionType;
  settings: SectionSettings;
  styles?: SectionStyles;
  visibility?: {
    desktop: boolean;
    mobile: boolean;
  };
  disabled?: boolean;
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
  typography?: {
    fontFamily: string;
    headingFont: string;
    baseFontSize: number;
    // Headings
    headingFontFamily?: string;
    headingFontWeight?: string;
    headingFontSize?: string;
    headingLineHeight?: string;
    // Paragraphs
    paragraphFontFamily?: string;
    paragraphFontWeight?: string;
    paragraphFontSize?: string;
    paragraphLineHeight?: string;
  };
}
