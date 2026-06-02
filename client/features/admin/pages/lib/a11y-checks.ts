import { CustomizerSection, PageData } from '@/types/customizer';

export interface A11yIssue {
  id: string;
  sectionId?: string;
  severity: 'error' | 'warning';
  message: string;
}

function hex(input: string): { r: number; g: number; b: number } | null {
  const m = input.trim().match(/^#?([a-f0-9]{3}|[a-f0-9]{6})$/i);
  if (!m) return null;
  let h = m[1];
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

function luminance({ r, g, b }: { r: number; g: number; b: number }): number {
  const c = [r, g, b].map((x) => {
    const v = x / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}

function contrast(a: string, b: string): number | null {
  const ca = hex(a);
  const cb = hex(b);
  if (!ca || !cb) return null;
  const la = luminance(ca);
  const lb = luminance(cb);
  const [lighter, darker] = la > lb ? [la, lb] : [lb, la];
  return (lighter + 0.05) / (darker + 0.05);
}

function flatten(sections: CustomizerSection[]): CustomizerSection[] {
  const out: CustomizerSection[] = [];
  const visit = (nodes: CustomizerSection[]) => {
    for (const n of nodes) {
      out.push(n);
      if (n.children?.length) visit(n.children);
    }
  };
  visit(sections);
  return out;
}

export function runA11yChecks(page: PageData): A11yIssue[] {
  const issues: A11yIssue[] = [];
  const flat = flatten(page.content.sections);

  // 1. Images / banners missing alt text
  flat.forEach((node) => {
    if (node.type === 'image-block') {
      const s = node.settings as Record<string, any>;
      if (s?.image && !s.alt) {
        issues.push({
          id: `alt-${node.id}`,
          sectionId: node.id,
          severity: 'error',
          message: 'Image block is missing alt text.',
        });
      }
    }
    if (node.type === 'banner') {
      const s = node.settings as Record<string, any>;
      const slides = Array.isArray(s?.slides) ? s.slides : [];
      slides.forEach((slide: Record<string, any>, idx: number) => {
        if (slide?.backgroundImage && !slide?.headline) {
          issues.push({
            id: `banner-${node.id}-${idx}`,
            sectionId: node.id,
            severity: 'warning',
            message: `Banner slide ${idx + 1} has an image without a headline.`,
          });
        }
      });
    }
  });

  // 2. Contrast: when both bg and text color are set on a section, check ratio.
  flat.forEach((node) => {
    const styles = (node.styles as Record<string, any>) || {};
    const bg = styles.backgroundColor;
    const fg = styles.color || styles.textColor || styles.headlineColor;
    if (bg && fg) {
      const ratio = contrast(bg, fg);
      if (ratio !== null && ratio < 4.5) {
        issues.push({
          id: `contrast-${node.id}`,
          sectionId: node.id,
          severity: 'warning',
          message: `Low text contrast (${ratio.toFixed(1)}:1). Aim for 4.5:1 or higher.`,
        });
      }
    }
  });

  // 3. Heading order: collect heading levels in DOM order
  const levels: { id: string; level: number }[] = [];
  flat.forEach((node) => {
    if (node.type === 'heading') {
      const lvl = parseInt(((node.settings as Record<string, any>)?.level || 'h2').replace('h', ''), 10);
      if (!Number.isNaN(lvl)) levels.push({ id: node.id, level: lvl });
    }
  });
  if (levels.length > 1) {
    for (let i = 1; i < levels.length; i++) {
      if (levels[i].level > levels[i - 1].level + 1) {
        issues.push({
          id: `heading-skip-${levels[i].id}`,
          sectionId: levels[i].id,
          severity: 'warning',
          message: `Heading skips from H${levels[i - 1].level} to H${levels[i].level}.`,
        });
      }
    }
  }
  const h1Count = levels.filter((l) => l.level === 1).length;
  if (h1Count > 1) {
    issues.push({
      id: 'multiple-h1',
      severity: 'warning',
      message: `Page has ${h1Count} H1 headings. Use only one.`,
    });
  }

  // 4. Buttons missing text or link
  flat.forEach((node) => {
    if (node.type === 'button') {
      const s = node.settings as Record<string, any>;
      if (!s?.text) {
        issues.push({
          id: `btn-text-${node.id}`,
          sectionId: node.id,
          severity: 'error',
          message: 'Button is missing display text.',
        });
      }
      if (!s?.link) {
        issues.push({
          id: `btn-link-${node.id}`,
          sectionId: node.id,
          severity: 'warning',
          message: 'Button is missing a link URL.',
        });
      }
    }
  });

  return issues;
}
