import type { ThemeTokens } from '@/types/customizer';

/**
 * Serializes the page's theme tokens into a single CSS rule scoped to
 * the responsive section tree. Returns an empty string when no token
 * is set so callers can conditionally render the `<style>` tag.
 */
export function themeTokensToCss(tokens?: ThemeTokens | null): string {
  if (!tokens) return '';

  const lines: string[] = [];
  const push = (name: string, value?: string) => {
    if (value) lines.push(`${name}:${value};`);
  };

  push('--theme-color-brand', tokens.colors?.brand);
  push('--theme-color-accent', tokens.colors?.accent);
  push('--theme-color-background', tokens.colors?.background);
  push('--theme-color-foreground', tokens.colors?.foreground);
  push('--theme-color-muted', tokens.colors?.muted);
  push('--theme-color-border', tokens.colors?.border);
  push('--theme-color-success', tokens.colors?.success);
  push('--theme-color-danger', tokens.colors?.danger);
  push('--theme-font-body', tokens.fonts?.body);
  push('--theme-font-heading', tokens.fonts?.heading);
  push('--theme-radius-sm', tokens.radii?.sm);
  push('--theme-radius-md', tokens.radii?.md);
  push('--theme-radius-lg', tokens.radii?.lg);
  push('--theme-spacing-sm', tokens.spacing?.sm);
  push('--theme-spacing-md', tokens.spacing?.md);
  push('--theme-spacing-lg', tokens.spacing?.lg);
  push('--theme-shadow-sm', tokens.shadows?.sm);
  push('--theme-shadow-md', tokens.shadows?.md);
  push('--theme-shadow-lg', tokens.shadows?.lg);

  if (!lines.length) return '';
  return `.responsive-section, .responsive-section * { ${lines.join(' ')} }`;
}
