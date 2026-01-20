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

export interface CustomizerSection {
  id: string;
  type: SectionType;
  settings: Record<string, any>;
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
