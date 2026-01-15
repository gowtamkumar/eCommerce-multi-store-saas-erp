/**
 * Page Builder Utility Functions
 */

import { SectionStyles } from '@/types/page-builder';

// Width class mappings
const widthClasses = {
  full: 'w-full',
  container: 'container mx-auto',
  narrow: 'max-w-4xl mx-auto',
  custom: '',
};

// Box shadow mappings
const shadowClasses = {
  none: '',
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-lg',
  xl: 'shadow-xl',
  '2xl': 'shadow-2xl',
};

/**
 * Convert section styles to inline CSS and Tailwind classes
 */
export function stylesToCSS(styles: SectionStyles | undefined): { style: React.CSSProperties; className: string } {
  // Use default styles if undefined
  if (!styles) {
    styles = {
      width: 'container',
      alignment: 'left',
      paddingTop: 0,
      paddingBottom: 0,
      paddingLeft: 0,
      paddingRight: 0,
      marginTop: 0,
      marginBottom: 0,
      borderWidth: 0,
      borderRadius: 0,
      borderStyle: 'none',
      boxShadow: 'none',
      opacity: 100,
    };
  }

  const style: React.CSSProperties = {
    backgroundColor: styles.backgroundColor,
    color: styles.textColor,
    paddingTop: `${styles.paddingTop}px`,
    paddingBottom: `${styles.paddingBottom}px`,
    paddingLeft: `${styles.paddingLeft}px`,
    paddingRight: `${styles.paddingRight}px`,
    marginTop: `${styles.marginTop}px`,
    marginBottom: `${styles.marginBottom}px`,
    borderRadius: `${styles.borderRadius}px`,
    opacity: styles.opacity / 100,
  };

  // Add border styles if border width > 0
  if (styles.borderWidth > 0) {
    style.borderWidth = `${styles.borderWidth}px`;
    style.borderStyle = styles.borderStyle;
    style.borderColor = styles.borderColor;
  }

  // Width class
  const className = [
    styles.width === 'custom' ? '' : widthClasses[styles.width],
    shadowClasses[styles.boxShadow],
    styles.alignment === 'center' ? 'text-center' : styles.alignment === 'right' ? 'text-right' : '',
  ].filter(Boolean).join(' ');

  return { style, className };
}

/**
 * Generate unique section ID
 */
export function generateSectionId(): string {
  return `section-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Clone a section with new ID
 */
export function cloneSection(section: any): any {
  return {
    ...section,
    id: generateSectionId(),
  };
}
