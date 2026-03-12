"use client";

import BrandGrid from "@/features/brand/components/BrandGrid";
import FAQSection from "@/features/faq/components/FAQSection";
import BannerSlider from "@/features/pages/components/customizer/BannerSlider";
import BuilderButton from "@/features/pages/components/customizer/BuilderButton";
import CategoryGrid from "@/features/pages/components/customizer/CategoryGrid";
import ContactSection from "@/features/pages/components/customizer/ContactSection";
import Divider from "@/features/pages/components/customizer/Divider";
import Heading from "@/features/pages/components/customizer/Heading";
import ImageBlock from "@/features/pages/components/customizer/ImageBlock";
import Newsletter from "@/features/pages/components/customizer/Newsletter";
import OfferBanner from "@/features/pages/components/customizer/OfferBanner";
import Paragraph from "@/features/pages/components/customizer/Paragraph";
import ProductSlider from "@/features/pages/components/customizer/ProductSlider";
import ReviewSection from "@/features/pages/components/customizer/ReviewSection";
import Spacer from "@/features/pages/components/customizer/Spacer";
import StatsCounter from "@/features/pages/components/customizer/StatsCounter";
import TextBlock from "@/features/pages/components/customizer/TextBlock";
import VideoBlock from "@/features/pages/components/customizer/VideoBlock";
import { CustomizerSection } from "@/types/customizer";


interface SectionRendererProps {
  section: CustomizerSection;
  onSelect?: (id: string | null) => void;
  selectedId?: string | null;
}

const SectionRenderer: React.FC<SectionRendererProps> = ({ section, onSelect, selectedId }) => {
  if (!section) return null;

  const s = section.styles as any || {};

  const styles = {
    ...s, // Pass all raw styles for maximum compatibility
    paddingTop: s.paddingTop !== undefined ? (typeof s.paddingTop === 'number' ? `${s.paddingTop}px` : s.paddingTop) : undefined,
    paddingBottom: s.paddingBottom !== undefined ? (typeof s.paddingBottom === 'number' ? `${s.paddingBottom}px` : s.paddingBottom) : undefined,
    paddingLeft: s.paddingLeft !== undefined ? (typeof s.paddingLeft === 'number' ? `${s.paddingLeft}px` : s.paddingLeft) : undefined,
    paddingRight: s.paddingRight !== undefined ? (typeof s.paddingRight === 'number' ? `${s.paddingRight}px` : s.paddingRight) : undefined,
    marginTop: s.marginTop !== undefined ? (typeof s.marginTop === 'number' ? `${s.marginTop}px` : s.marginTop) : undefined,
    marginBottom: s.marginBottom !== undefined ? (typeof s.marginBottom === 'number' ? `${s.marginBottom}px` : s.marginBottom) : undefined,
    backgroundColor: s.backgroundColor,
    color: s.color || s.textColor,
    height: s.height ? (typeof s.height === 'number' ? `${s.height}px` : s.height) : undefined,
    width: s.width ? (typeof s.width === 'number' ? `${s.width}px` : s.width) : undefined,
    maxWidth: s.maxWidth ? (typeof s.maxWidth === 'number' ? `${s.maxWidth}px` : s.maxWidth) : undefined,
    textAlign: s.textAlign as any,
    borderRadius: s.borderRadius,
    borderWidth: s.borderWidth,
    borderStyle: s.borderStyle,
    borderColor: s.borderColor,
    boxShadow: s.boxShadow,
    // Content block specialty
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
    ...(s.headingFontFamily && { '--heading-font-family': s.headingFontFamily } as React.CSSProperties),
    ...(s.headingFontWeight && { '--heading-font-weight': s.headingFontWeight } as React.CSSProperties),
    ...(s.headingFontSize && { '--heading-font-size': s.headingFontSize } as React.CSSProperties),
    ...(s.headingLineHeight && { '--heading-line-height': s.headingLineHeight } as React.CSSProperties),
    ...(s.paragraphFontFamily && { '--paragraph-font-family': s.paragraphFontFamily } as React.CSSProperties),
    ...(s.paragraphFontWeight && { '--paragraph-font-weight': s.paragraphFontWeight } as React.CSSProperties),
    ...(s.paragraphFontSize && { '--paragraph-font-size': s.paragraphFontSize } as React.CSSProperties),
    ...(s.paragraphLineHeight && { '--paragraph-line-height': s.paragraphLineHeight } as React.CSSProperties),
  };

  // Build full structural CSS from StylesEditor fields
  const buildStructuralStyle = (): React.CSSProperties => {
    const css: Record<string, any> = {};
    const pick = (cssKey: string, sKey: string) => { if (s[sKey]) css[cssKey] = s[sKey]; };
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
    if (s.backgroundImage) css.backgroundImage = s.backgroundImage.startsWith('url(') ? s.backgroundImage : `url(${s.backgroundImage})`;
    pick('backgroundSize', 'backgroundSize'); pick('backgroundPosition', 'backgroundPosition'); pick('backgroundRepeat', 'backgroundRepeat');
    pick('borderWidth', 'borderWidth'); pick('borderStyle', 'borderStyle');
    pick('borderColor', 'borderColor'); pick('borderRadius', 'borderRadius');
    pick('boxShadow', 'boxShadow'); pick('opacity', 'opacity'); pick('filter', 'filter');
    pick('transition', 'transition'); pick('transform', 'transform');
    return css as React.CSSProperties;
  };



  // Responsive Style Generator
  const generateResponsiveCSS = (id: string, s: any) => {
    const props: string[] = [];
    const add = (cssKey: string, sKey: string) => {
      if (s[sKey] !== undefined && s[sKey] !== '') {
        props.push(`${cssKey}:${s[sKey]} !important;`);
      }
    };

    add('display', 'mobileDisplay');
    add('flex-direction', 'mobileFlexDirection');
    add('width', 'mobileWidth');
    add('height', 'mobileHeight');
    add('text-align', 'mobileTextAlign');
    add('font-size', 'mobileFontSize');
    add('justify-content', 'mobileJustifyContent');
    add('align-items', 'mobileAlignItems');
    add('gap', 'mobileGap');
    add('grid-template-columns', 'mobileGridTemplateColumns');
    add('padding-top', 'mobilePaddingTop');
    add('padding-bottom', 'mobilePaddingBottom');
    add('margin-top', 'mobileMarginTop');
    add('margin-bottom', 'mobileMarginBottom');

    if (props.length === 0) return null;

    const cssString = props.join('');
    // We target BOTH the standard media query AND a specific class for the editor preview
    return (
      <style>{`
        @media (max-width: 768px) { #${id} { ${cssString} } }
        .is-mobile-preview #${id} { ${cssString} }
      `}</style>
    );
  };

  const settings = section.settings as any;

  // Visibility Logic
  let visibilityClasses = 'block';
  if (section.visibility) {
    const { desktop, mobile } = section.visibility;
    if (mobile && desktop) visibilityClasses = 'block';
    else if (!mobile && desktop) visibilityClasses = 'hidden md:block';
    else if (mobile && !desktop) visibilityClasses = 'block md:hidden';
    else if (!mobile && !desktop) visibilityClasses = 'hidden';
  }

  const structuralStyle = buildStructuralStyle();
  const nodeId = `el-${section.id}`;
  const responsiveStyles = generateResponsiveCSS(nodeId, s);

  const renderContent = () => {
    switch (section.type) {
      case "banner":
        return <BannerSlider settings={settings} styles={styles} />;

      case "product-slider":
        return (
          <ProductSlider
            sectionId={section.id}
            headline={settings?.headline}
            count={settings?.count}
            source={settings?.source}
            productIds={settings?.productIds}
            collectionId={settings?.source === 'collection' ? settings?.collectionId : undefined}
            layout={settings?.layout}
            columns={settings?.columns}
            mobileColumns={settings?.mobileColumns}
            styles={styles}
          />
        );

      case "category-grid":
        return (
          <CategoryGrid
            sectionId={section.id}
            title={settings?.title}
            count={settings?.count}
            source={settings?.source}
            items={settings?.items}
            columns={settings?.columns}
            mobileColumns={settings?.mobileColumns}
            styles={styles}
          />
        );

      case "offer-banner":
        return <OfferBanner settings={settings} styles={styles} />;

      case "review-slider":
        return <ReviewSection settings={settings} styles={styles} />;

      case "text-block":
        return <TextBlock html={settings?.html} headline={settings?.headline} styles={styles} />;

      case "image-block":
        return <ImageBlock settings={settings} styles={styles} />;

      case "button":
        return <BuilderButton variant={settings?.variant} size={settings?.size} text={settings?.text} styles={styles} link={settings?.link} />;

      case "heading":
        return <Heading settings={settings} styles={styles} />;

      case "paragraph":
        return <Paragraph settings={settings} styles={styles} />;

      case "divider":
        return <Divider settings={settings} styles={styles} />;

      case "spacer":
        return <Spacer settings={settings} />;

      case "faq-section":
        return (
          <FAQSection
            items={settings?.items}
            headline={settings?.title}
            subline={settings?.subline}
            styles={styles}
            buttonText={settings?.buttonText}
            faqIds={settings?.faqIds}
            source={settings?.source}
          />
        );
      case "brand-grid":
        return (
          <BrandGrid
            sectionId={section.id}
            title={settings?.title}
            count={settings?.count}
            source={settings?.source}
            items={settings?.items}
            columns={settings?.columns}
            mobileColumns={settings?.mobileColumns}
            styles={styles}
          />
        );
      case "newsletter":
        return (
          <Newsletter
            title={settings?.title}
            description={settings?.description}
            buttonText={settings?.buttonText}
            placeholder={settings?.placeholder}
            styles={styles}
          />
        );
      case "stats-counter":
        return <StatsCounter stats={settings?.items} settings={settings} styles={styles} />;

      case "video-block":
        return <VideoBlock settings={settings} styles={styles} />;

      case "contact":
        return <ContactSection settings={settings} styles={styles} />;

      case "section":
        return (
          <>
            {section.children?.map(child => <SectionRenderer key={child.id} section={child} onSelect={onSelect} selectedId={selectedId} />)}
            {(!section.children || section.children.length === 0) && (
              <div className="p-8 border-2 border-dashed border-slate-300 dark:border-slate-700 m-4 text-center text-slate-400">Drop a Row here</div>
            )}
          </>
        );

      case "row":
        return (
          <>
            {section.children?.map(child => <SectionRenderer key={child.id} section={child} onSelect={onSelect} selectedId={selectedId} />)}
            {(!section.children || section.children.length === 0) && (
              <div className="p-8 border-2 border-dashed border-slate-300 dark:border-slate-700 m-4 w-full text-center text-slate-400">Drop Columns here</div>
            )}
          </>
        );

      case "column":
        return (
          <>
            {section.children?.map(child => <SectionRenderer key={child.id} section={child} onSelect={onSelect} selectedId={selectedId} />)}
            {(!section.children || section.children.length === 0) && (
              <div className="p-8 border-2 border-dashed border-slate-300 dark:border-slate-700 m-4 w-full text-center text-slate-400">Drop Content here</div>
            )}
          </>
        );

      default:
        return null;
    }
  };

  const isStructural = ['section', 'row', 'column'].includes(section.type);
  const isSelected = selectedId === section.id;
  const isEditorMode = !!onSelect;

  // Wrapper tag and classes
  const Tag = section.type === "section" ? "section" : "div";
  const wrapperClasses = `
    ${section.type === 'section' ? 'relative overflow-hidden' : ''}
    ${section.type === 'row' ? 'relative' : ''}
    ${section.type === 'column' ? 'flex flex-col relative' : ''}
  `;

  // Merge defaults for Row/Col
  const finalStyle: React.CSSProperties = {
    ...(section.type === 'row' ? { display: 'flex', flexDirection: 'row' } : {}),
    ...(section.type === 'column' ? { flex: 1, display: 'flex' } : {}),
    ...structuralStyle
  };

  return (
    <div
      key={section.id}
      onClick={(e) => {
        if (onSelect) {
          e.stopPropagation();
          onSelect(section.id);
        }
      }}
      className={`responsive-section relative group transition-all duration-200 ${visibilityClasses} 
        ${(isStructural && isEditorMode) ? 'min-h-[20px]' : ''}
        ${isEditorMode ? 'cursor-pointer' : ''}
        ${(isSelected && isEditorMode) ? 'outline outline-2 outline-brand-500 outline-offset-[-2px] z-[5]' : (isEditorMode ? 'hover:outline hover:outline-2 hover:outline-brand-500/30 hover:outline-offset-[-2px]' : '')}
      `}
    >
      {isSelected && isEditorMode && (
        <div className="absolute top-0 left-0 bg-brand-500 text-white text-[9px] font-bold px-1.5 py-0.5 z-[10] uppercase tracking-wider rounded-br shadow-sm pointer-events-none">
          {section.type.replace('-', ' ')}
        </div>
      )}

      {responsiveStyles}
      <Tag id={nodeId} className={wrapperClasses} style={finalStyle}>
        {renderContent()}
      </Tag>
    </div>
  );
};

export default SectionRenderer;
