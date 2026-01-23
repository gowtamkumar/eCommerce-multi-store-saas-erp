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
  | 'faq-section';

export interface SectionStyles {
  paddingTop: number;
  paddingBottom: number;
  backgroundColor?: string;
  textColor?: string;
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
  collectionId?: string;
  count?: number;
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
  columns?: number;
  items: CategoryItem[];
}

export interface OfferBannerSettings {
  headline?: string;
  subline?: string;
  buttonText?: string;
  buttonLink?: string;
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
  reviews: ReviewItem[];
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
  layout?: 'left' | 'right';
  buttonText?: string;
  buttonLink?: string;
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
  | Record<string, any>;

export interface CustomizerSection {
  id: string;
  type: SectionType;
  settings: SectionSettings;
  styles?: SectionStyles;
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
}
