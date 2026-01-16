/**
 * Elementor-Style Page Builder Type Definitions
 */

// Section styling options
export interface SectionStyles {
  // Layout
  width: 'full' | 'container' | 'narrow' | 'custom';
  customWidth?: string;
  alignment: 'left' | 'center' | 'right';

  // Colors
  backgroundColor?: string;
  textColor?: string;
  borderColor?: string;

  // Spacing (in pixels)
  paddingTop: number;
  paddingBottom: number;
  paddingLeft: number;
  paddingRight: number;
  marginTop: number;
  marginBottom: number;

  // Border
  borderWidth: number;
  borderRadius: number;
  borderStyle: 'none' | 'solid' | 'dashed' | 'dotted';

  // Effects
  boxShadow: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  opacity: number;
}

// Default styles for new sections
export const defaultSectionStyles: SectionStyles = {
  width: 'container',
  alignment: 'left',
  paddingTop: 48,
  paddingBottom: 48,
  paddingLeft: 16,
  paddingRight: 16,
  marginTop: 0,
  marginBottom: 0,
  borderWidth: 0,
  borderRadius: 0,
  borderStyle: 'none',
  boxShadow: 'none',
  opacity: 100,
};

// Section type definitions
export type SectionType = 'hero' | 'rich-text' | 'product-grid' | 'faq' | 'cta' | 'features';

export interface PageBuilderSection {
  id: string;
  type: SectionType;
  content: Record<string, unknown>;
  styles: SectionStyles;
  order: number;
  isExpanded: boolean;
}

// Page data structure
export interface PageBuilderData {
  id?: string;
  title: string;
  slug: string;
  isHomePage: boolean;
  status: 'draft' | 'published';
  sections: PageBuilderSection[];
  metaTitle: string;
  metaDescription: string;
}

// Section template for quick add
export interface SectionTemplate {
  type: SectionType;
  label: string;
  icon: string;
  description: string;
  defaultContent: Record<string, unknown>;
}
