import { CustomizerSection } from '@/types/customizer';

interface OverrideMap {
  cls: string;
  prefix: string;
}

const MOBILE: OverrideMap = { cls: 'is-mobile-preview', prefix: 'mobile' };
const TABLET: OverrideMap = { cls: 'is-tablet-preview', prefix: 'tablet' };

const KEYS: Array<[string, string]> = [
  ['display', 'Display'],
  ['flex-direction', 'FlexDirection'],
  ['width', 'Width'],
  ['height', 'Height'],
  ['text-align', 'TextAlign'],
  ['font-size', 'FontSize'],
  ['justify-content', 'JustifyContent'],
  ['align-items', 'AlignItems'],
  ['gap', 'Gap'],
  ['grid-template-columns', 'GridTemplateColumns'],
  ['padding-top', 'PaddingTop'],
  ['padding-bottom', 'PaddingBottom'],
  ['margin-top', 'MarginTop'],
  ['margin-bottom', 'MarginBottom'],
];

function cssRulesForMap(id: string, s: Record<string, any>, map: OverrideMap, mediaQuery: string): string {
  const props: string[] = [];
  KEYS.forEach(([cssKey, suffix]) => {
    const styleKey = `${map.prefix}${suffix}`;
    if (s[styleKey] !== undefined && s[styleKey] !== '') {
      props.push(`${cssKey}:${s[styleKey]} !important;`);
    }
  });
  if (props.length === 0) return '';
  const cssString = props.join('');
  return `
    @media (${mediaQuery}) { #${id} { ${cssString} } }
    .${map.cls} #${id} { ${cssString} }
  `;
}

function walkSections(sections: CustomizerSection[], acc: string[]) {
  for (const section of sections) {
    const nodeId = `el-${section.id}`;
    const s = (section.styles as Record<string, any>) || {};
    const mobileCss = cssRulesForMap(nodeId, s, MOBILE, 'max-width: 768px');
    if (mobileCss) acc.push(mobileCss);
    const tabletCss = cssRulesForMap(nodeId, s, TABLET, 'min-width: 769px) and (max-width: 1024px');
    if (tabletCss) acc.push(tabletCss);
    if (section.children?.length) walkSections(section.children, acc);
  }
}

/** Aggregated stylesheet for mobile + tablet overrides across the section tree. */
export function collectResponsiveStylesheet(sections: CustomizerSection[]): string {
  const chunks: string[] = [];
  walkSections(sections, chunks);
  return chunks.join('\n');
}
