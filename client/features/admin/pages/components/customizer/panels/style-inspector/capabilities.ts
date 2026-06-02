/**
 * Maps a block's nodeType to the set of style groups it should expose.
 *
 * Keeping this in one place lets us answer "which controls does X show?"
 * by reading a single function rather than chasing conditionals through
 * a 700-line render tree. To onboard a new block kind: add its quirks
 * here and the conditional renders in StyleInspector pick it up.
 */

const STRUCTURAL_TYPES = new Set(['section', 'row', 'column']);
const HERO_TYPES = new Set(['banner', 'offer-banner']);
const SECTION_TITLE_TYPES = new Set([
  'banner',
  'product-slider',
  'new-arrivals',
  'category-grid',
  'brand-grid',
  'review-slider',
  'newsletter',
  'faq-section',
  'contact',
]);
const CARD_TYPES = new Set(['category-grid', 'brand-grid', 'review-slider', 'stats-counter']);
const BUTTON_TYPES = new Set(['button', 'contact']);

export interface StyleCapabilities {
  isStructural: boolean;
  isRow: boolean;
  isHero: boolean;
  hasSectionTitle: boolean;
  hasCards: boolean;
  hasButton: boolean;
  isFaq: boolean;
  isContact: boolean;
  /** Some specialty blocks (e.g. brand-grid) deliberately hide style groups
   *  that don't apply or would conflict with their internal styling. */
  omitTypography: boolean;
  omitBorder: boolean;
  omitEffects: boolean;
}

export function capabilitiesFor(nodeType: string): StyleCapabilities {
  return {
    isStructural: STRUCTURAL_TYPES.has(nodeType),
    isRow: nodeType === 'row',
    isHero: HERO_TYPES.has(nodeType),
    hasSectionTitle: SECTION_TITLE_TYPES.has(nodeType),
    hasCards: CARD_TYPES.has(nodeType),
    hasButton: BUTTON_TYPES.has(nodeType),
    isFaq: nodeType === 'faq-section',
    isContact: nodeType === 'contact',
    omitTypography: nodeType === 'brand-grid',
    omitBorder: nodeType === 'brand-grid',
    omitEffects: nodeType === 'brand-grid',
  };
}
