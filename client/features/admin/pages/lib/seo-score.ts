import { PageData } from '@/types/customizer';

export interface SeoCheck {
  id: string;
  label: string;
  status: 'pass' | 'warn' | 'fail';
  message: string;
}

export interface SeoReport {
  score: number;
  checks: SeoCheck[];
}

function countText(html: string): number {
  return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim().split(' ').filter(Boolean).length;
}

function gatherSectionText(sections: PageData['content']['sections']): string {
  const parts: string[] = [];
  const visit = (nodes: typeof sections) => {
    for (const n of nodes) {
      const s = n.settings as Record<string, any>;
      ['headline', 'subline', 'title', 'description', 'text', 'content', 'html'].forEach((k) => {
        if (typeof s?.[k] === 'string') parts.push(s[k]);
      });
      if (n.children?.length) visit(n.children);
    }
  };
  visit(sections);
  return parts.join(' ');
}

function countHeadings(sections: PageData['content']['sections']): number {
  let count = 0;
  const visit = (nodes: typeof sections) => {
    for (const n of nodes) {
      if (n.type === 'heading') count += 1;
      const s = n.settings as Record<string, any>;
      if (s?.headline || s?.title) count += 1;
      if (n.children?.length) visit(n.children);
    }
  };
  visit(sections);
  return count;
}

export function buildSeoReport(page: PageData): SeoReport {
  const checks: SeoCheck[] = [];

  const title = page.metaTitle?.trim() || page.title?.trim() || '';
  if (!title) {
    checks.push({ id: 'title', label: 'Title', status: 'fail', message: 'Set a page or meta title.' });
  } else if (title.length < 30) {
    checks.push({
      id: 'title',
      label: 'Title',
      status: 'warn',
      message: `Title is ${title.length} chars (target 30-60).`,
    });
  } else if (title.length > 60) {
    checks.push({
      id: 'title',
      label: 'Title',
      status: 'warn',
      message: `Title is ${title.length} chars (over 60 may truncate).`,
    });
  } else {
    checks.push({ id: 'title', label: 'Title', status: 'pass', message: 'Title length is ideal.' });
  }

  const desc = page.metaDescription?.trim() || '';
  if (!desc) {
    checks.push({
      id: 'desc',
      label: 'Meta description',
      status: 'fail',
      message: 'Add a meta description.',
    });
  } else if (desc.length < 120 || desc.length > 160) {
    checks.push({
      id: 'desc',
      label: 'Meta description',
      status: 'warn',
      message: `Description is ${desc.length} chars (target 120-160).`,
    });
  } else {
    checks.push({ id: 'desc', label: 'Meta description', status: 'pass', message: 'Length is optimal.' });
  }

  if (!page.ogImage) {
    checks.push({
      id: 'og',
      label: 'Social image',
      status: 'warn',
      message: 'Add an Open Graph image for social previews.',
    });
  } else {
    checks.push({ id: 'og', label: 'Social image', status: 'pass', message: 'OG image set.' });
  }

  const slug = (page.slug || '').trim();
  if (!page.isHomePage && (!slug || /[^a-z0-9-/]/.test(slug))) {
    checks.push({
      id: 'slug',
      label: 'URL slug',
      status: slug ? 'warn' : 'fail',
      message: slug ? 'Use only lowercase letters, numbers, and hyphens.' : 'Set a URL slug.',
    });
  } else {
    checks.push({ id: 'slug', label: 'URL slug', status: 'pass', message: 'URL is SEO friendly.' });
  }

  const headingCount = countHeadings(page.content.sections);
  if (headingCount === 0) {
    checks.push({
      id: 'headings',
      label: 'Headings',
      status: 'fail',
      message: 'Add at least one heading or banner headline.',
    });
  } else {
    checks.push({
      id: 'headings',
      label: 'Headings',
      status: 'pass',
      message: `${headingCount} headings detected.`,
    });
  }

  const text = gatherSectionText(page.content.sections);
  const wordCount = countText(text);
  if (wordCount < 100) {
    checks.push({
      id: 'words',
      label: 'Content length',
      status: 'warn',
      message: `Only ${wordCount} words. Aim for 300+.`,
    });
  } else {
    checks.push({
      id: 'words',
      label: 'Content length',
      status: 'pass',
      message: `${wordCount} words of content.`,
    });
  }

  const weights = { pass: 1, warn: 0.5, fail: 0 } as const;
  const score = Math.round(
    (checks.reduce((acc, c) => acc + weights[c.status], 0) / checks.length) * 100,
  );
  return { score, checks };
}

/** JSON-LD WebPage structured data for the storefront. */
export function buildPageJsonLd(page: PageData, baseUrl: string): string {
  const url = page.isHomePage ? baseUrl : `${baseUrl}/${page.slug.replace(/^\/+/, '')}`;
  const ld = {
    '@context': 'https://schema.org',
    '@type': page.isHomePage ? 'WebSite' : 'WebPage',
    name: page.metaTitle || page.title,
    description: page.metaDescription || undefined,
    url,
    image: page.ogImage || undefined,
  };
  return JSON.stringify(ld);
}
