"use client";
import EditableSection from "@/features/admin/pages/components/customizer/EditableSection";
import { BLOCK_DEFINITIONS, isStructuralType } from "@/features/admin/pages/components/customizer/blocks";
import { CustomizerSection } from "@/types/customizer";
import React from "react";

// Page-builder data is intentionally schemaless: every block has its own shape.
// We expose it as a loose record so editors and runtime components can read
// whatever keys they understand.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type LooseRecord = Record<string, any>;

export interface RuntimeSectionContentProps {
  section: CustomizerSection;
  onSelect?: (id: string | null) => void;
  selectedId?: string | null;
}

const RuntimeSectionContent: React.FC<RuntimeSectionContentProps> = ({ section, onSelect, selectedId }) => {
  if (!section) return null;
  if (section.hidden && !onSelect) return null;

  const definition = BLOCK_DEFINITIONS[section.type];
  const settings = (section.settings as LooseRecord) || {};
  const s = (section.styles as LooseRecord) || {};

  const styles: Record<string, unknown> = {
    ...s,
    paddingTop: toCssLength(s.paddingTop),
    paddingBottom: toCssLength(s.paddingBottom),
    paddingLeft: toCssLength(s.paddingLeft),
    paddingRight: toCssLength(s.paddingRight),
    marginTop: toCssLength(s.marginTop),
    marginBottom: toCssLength(s.marginBottom),
    backgroundColor: s.backgroundColor,
    color: s.color || s.textColor,
    height: toCssLength(s.height),
    width: toCssLength(s.width),
    maxWidth: toCssLength(s.maxWidth),
    textAlign: s.textAlign as React.CSSProperties['textAlign'],
    borderRadius: s.borderRadius,
    borderWidth: s.borderWidth,
    borderStyle: s.borderStyle,
    borderColor: s.borderColor,
    boxShadow: s.boxShadow,
    overlayOpacity: s.overlayOpacity,
    headlineColor: s.headlineColor,
    sublineColor: s.sublineColor,
    iconColor: s.iconColor,
    iconBgColor: s.iconBgColor,
    iconBorder: s.iconBorder,
    buttonColor: s.buttonColor,
    buttonTextColor: s.buttonTextColor,
    imageRadius: s.imageRadius,
    imageBorder: s.imageBorder,
    imageShadow: s.imageShadow,
    cardRadius: s.cardRadius,
    cardBorder: s.cardBorder,
    cardShadow: s.cardShadow,
    ...cssVar('--heading-font-family', s.headingFontFamily),
    ...cssVar('--heading-font-weight', s.headingFontWeight),
    ...cssVar('--heading-font-size', s.headingFontSize),
    ...cssVar('--heading-line-height', s.headingLineHeight),
    ...cssVar('--paragraph-font-family', s.paragraphFontFamily),
    ...cssVar('--paragraph-font-weight', s.paragraphFontWeight),
    ...cssVar('--paragraph-font-size', s.paragraphFontSize),
    ...cssVar('--paragraph-line-height', s.paragraphLineHeight),
  };

  const renderChild = (child: CustomizerSection) =>
    onSelect ? (
      <EditableSection key={child.id} section={child} onSelect={onSelect} selectedId={selectedId} />
    ) : (
      <RuntimeSectionContent key={child.id} section={child} />
    );

  const renderContent = () => {
    if (isStructuralType(section.type)) {
      const placeholder = STRUCTURAL_PLACEHOLDERS[section.type];
      const children = section.children ?? [];
      if (children.length === 0 && onSelect && placeholder) {
        return (
          <div className="p-8 border-2 border-dashed border-slate-300 dark:border-slate-700 m-4 w-full text-center text-slate-400">
            {placeholder}
          </div>
        );
      }
      return <>{children.map(renderChild)}</>;
    }

    const Runtime = definition?.Runtime;
    if (Runtime) {
      return <Runtime section={section} settings={settings} styles={styles} />;
    }
    return null;
  };

  // ─── Visibility ───────────────────────────────────────────────────────
  const visibility = section.visibility;
  const tabletVisible = visibility?.tablet ?? visibility?.desktop ?? true;
  const visibilityClasses: string[] = [];
  if (visibility) {
    visibilityClasses.push(visibility.mobile ? 'block' : 'hidden');
    visibilityClasses.push(tabletVisible ? 'md:block' : 'md:hidden');
    visibilityClasses.push(visibility.desktop ? 'lg:block' : 'lg:hidden');
  } else {
    visibilityClasses.push('block');
  }

  const Tag = section.type === 'section' ? 'section' : 'div';
  const wrapperClasses = `
    ${section.type === 'section' ? 'relative overflow-hidden' : ''}
    ${section.type === 'row' ? 'relative' : ''}
    ${section.type === 'column' ? 'flex flex-col relative' : ''}
  `;

  const finalStyle: React.CSSProperties = {
    ...(section.type === 'row' ? { display: 'flex', flexDirection: 'row' } : {}),
    ...(section.type === 'column' ? { flex: 1, display: 'flex' } : {}),
    ...buildStructuralStyle(section, s),
  };

  const nodeId = `el-${section.id}`;

  return (
    <div className={`responsive-section ${visibilityClasses.join(' ')}`}>
      <Tag id={nodeId} className={wrapperClasses} style={finalStyle}>
        {renderContent()}
      </Tag>
    </div>
  );
};

// ─── Helpers ────────────────────────────────────────────────────────────
const STRUCTURAL_PLACEHOLDERS: Record<string, string> = {
  section: 'Drop a Row here',
  row: 'Drop Columns here',
  column: 'Drop Content here',
};

function toCssLength(value: unknown): string | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  return typeof value === 'number' ? `${value}px` : (value as string);
}

function cssVar(name: string, value: unknown): React.CSSProperties {
  if (value === undefined || value === null || value === '') return {};
  return { [name]: value as string } as React.CSSProperties;
}

function buildStructuralStyle(
  section: CustomizerSection,
  s: LooseRecord,
): React.CSSProperties {
  const css: Record<string, unknown> = {};
  const pick = (cssKey: string, sKey: string) => {
    if (s[sKey] !== undefined && s[sKey] !== '') css[cssKey] = s[sKey];
  };
  pick('display', 'display');
  pick('position', 'position');
  pick('overflow', 'overflow');
  pick('zIndex', 'zIndex');
  pick('top', 'top'); pick('right', 'right'); pick('bottom', 'bottom'); pick('left', 'left');
  pick('flexDirection', 'flexDirection'); pick('flexWrap', 'flexWrap');
  pick('justifyContent', 'justifyContent'); pick('alignItems', 'alignItems');
  pick('gap', 'gap'); pick('flexGrow', 'flexGrow'); pick('flexShrink', 'flexShrink'); pick('flexBasis', 'flexBasis');
  pick('gridTemplateColumns', 'gridTemplateColumns'); pick('gridTemplateRows', 'gridTemplateRows');
  pick('gap', 'gridGap'); pick('columnGap', 'columnGap'); pick('rowGap', 'rowGap');
  pick('gridColumn', 'gridColumn'); pick('gridRow', 'gridRow');

  // Banner-style blocks bleed to edge; suppress padding so the background
  // image fills the whole frame.
  const isFullBleed = ['banner', 'offer-banner'].includes(section.type);
  if (!isFullBleed) {
    if (s.paddingTop) css.paddingTop = s.paddingTop;
    if (s.paddingRight) css.paddingRight = s.paddingRight;
    if (s.paddingBottom) css.paddingBottom = s.paddingBottom;
    if (s.paddingLeft) css.paddingLeft = s.paddingLeft;
  }
  if (s.marginTop) css.marginTop = s.marginTop;
  if (s.marginRight) css.marginRight = s.marginRight;
  if (s.marginBottom) css.marginBottom = s.marginBottom;
  if (s.marginLeft) css.marginLeft = s.marginLeft;
  pick('width', 'width'); pick('height', 'height');
  pick('minWidth', 'minWidth'); pick('maxWidth', 'maxWidth');
  pick('minHeight', 'minHeight'); pick('maxHeight', 'maxHeight');
  pick('fontFamily', 'fontFamily'); pick('fontSize', 'fontSize');
  pick('fontWeight', 'fontWeight'); pick('lineHeight', 'lineHeight');
  pick('letterSpacing', 'letterSpacing'); pick('textAlign', 'textAlign');
  pick('textTransform', 'textTransform'); pick('color', 'color');
  pick('backgroundColor', 'backgroundColor');
  if (s.backgroundImage) {
    css.backgroundImage = s.backgroundImage.startsWith('url(')
      ? s.backgroundImage
      : `url(${s.backgroundImage})`;
  }
  pick('backgroundSize', 'backgroundSize'); pick('backgroundPosition', 'backgroundPosition'); pick('backgroundRepeat', 'backgroundRepeat');
  pick('borderWidth', 'borderWidth'); pick('borderStyle', 'borderStyle');
  pick('borderColor', 'borderColor'); pick('borderRadius', 'borderRadius');
  pick('boxShadow', 'boxShadow'); pick('opacity', 'opacity'); pick('filter', 'filter');
  pick('transition', 'transition'); pick('transform', 'transform');
  return css as React.CSSProperties;
}

export default RuntimeSectionContent;
