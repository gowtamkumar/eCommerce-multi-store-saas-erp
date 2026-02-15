import BrandGrid from "@/features/brand/components/BrandGrid";
import FAQSection from "@/features/faq/components/FAQSection";
import BannerSlider from "@/features/pages/components/customizer/BannerSlider";
import BuilderButton from "@/features/pages/components/customizer/BuilderButton";
import CategoryGrid from "@/features/pages/components/customizer/CategoryGrid";
import ContactSection from "@/features/pages/components/customizer/ContactSection";
import ImageBlock from "@/features/pages/components/customizer/ImageBlock";
import Newsletter from "@/features/pages/components/customizer/Newsletter";
import OfferBanner from "@/features/pages/components/customizer/OfferBanner";
import ProductSlider from "@/features/pages/components/customizer/ProductSlider";
import ReviewSection from "@/features/pages/components/customizer/ReviewSection";
import StatsCounter from "@/features/pages/components/customizer/StatsCounter";
import TextBlock from "@/features/pages/components/customizer/TextBlock";
import VideoBlock from "@/features/pages/components/customizer/VideoBlock";
import { CustomizerSection } from "@/types/customizer";


interface SectionRendererProps {
  section: CustomizerSection;
}

const SectionRenderer: React.FC<SectionRendererProps> = ({ section }) => {
  if (!section) return null;

  const settings = section.settings as any;
  const styles = {
    paddingTop: `${section.styles?.paddingTop || 0}px`,
    paddingBottom: `${section.styles?.paddingBottom || 0}px`,
    backgroundColor: section.styles?.backgroundColor,
    color: section.styles?.textColor,
    height: section.styles?.height,
    overlayOpacity: section.styles?.overlayOpacity,
    textAlign: section.styles?.textAlign,
    headlineColor: section.styles?.headlineColor,
    sublineColor: section.styles?.sublineColor,
    iconColor: section.styles?.iconColor,
    iconBgColor: section.styles?.iconBgColor,
    iconBorder: section.styles?.iconBorder,
    buttonColor: section.styles?.buttonColor,
    buttonTextColor: section.styles?.buttonTextColor,
    imageRadius: section.styles?.imageRadius,
    imageBorder: section.styles?.imageBorder,
    imageShadow: section.styles?.imageShadow,
    // Section-specific typography CSS custom properties
    ...(section.styles?.headingFontFamily && { '--heading-font-family': section.styles.headingFontFamily } as React.CSSProperties),
    ...(section.styles?.headingFontWeight && { '--heading-font-weight': section.styles.headingFontWeight } as React.CSSProperties),
    ...(section.styles?.headingFontSize && { '--heading-font-size': section.styles.headingFontSize } as React.CSSProperties),
    ...(section.styles?.headingLineHeight && { '--heading-line-height': section.styles.headingLineHeight } as React.CSSProperties),
    ...(section.styles?.paragraphFontFamily && { '--paragraph-font-family': section.styles.paragraphFontFamily } as React.CSSProperties),
    ...(section.styles?.paragraphFontWeight && { '--paragraph-font-weight': section.styles.paragraphFontWeight } as React.CSSProperties),
    ...(section.styles?.paragraphFontSize && { '--paragraph-font-size': section.styles.paragraphFontSize } as React.CSSProperties),
    ...(section.styles?.paragraphLineHeight && { '--paragraph-line-height': section.styles.paragraphLineHeight } as React.CSSProperties),
  };



  // Visibility Logic
  let visibilityClasses = 'block';
  if (section.visibility) {
    const { desktop, mobile } = section.visibility;
    if (mobile && desktop) visibilityClasses = 'block';
    else if (!mobile && desktop) visibilityClasses = 'hidden md:block';
    else if (mobile && !desktop) visibilityClasses = 'block md:hidden';
    else if (!mobile && !desktop) visibilityClasses = 'hidden';
  }

  const renderContent = () => {
    switch (section.type) {
      case "banner":
        return (
          <BannerSlider settings={settings} styles={styles} />
        );

      case "product-slider":
        return (
          <ProductSlider
            headline={settings?.headline}
            count={settings?.count}
            source={settings?.source}
            productIds={settings?.productIds}
            collectionId={settings?.source === 'collection' ? settings?.collectionId : undefined}
            layout={settings?.layout}
            columns={settings?.columns}
            styles={styles}
          />
        );

      case "category-grid":
        return (
          <CategoryGrid
            title={settings?.title}
            count={settings?.count}
            source={settings?.source}
            items={settings?.items}
            columns={settings?.columns}
            styles={styles}
          />
        );

      case "offer-banner":
        return (
          <OfferBanner settings={settings} styles={styles} />
        );

      case "review-slider":
        return (
          <ReviewSection
            settings={settings}
            styles={styles}
          />
        );

      case "text-block":
        return (
          <TextBlock html={settings?.html} headline={settings?.headline} styles={styles} />
        );

      case "image-block":
        return (
          <ImageBlock
            settings={settings}
            styles={styles}
          />
        );

      case "button":
        return (
          <BuilderButton variant={settings?.variant} size={settings?.size} text={settings?.text} styles={styles} link={settings?.link} />
        );

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
            title={settings?.title}
            count={settings?.count}
            source={settings?.source}
            items={settings?.items}
            columns={settings?.columns}
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
        return (
          <StatsCounter
            stats={settings?.items}
            styles={styles}
          />
        );
      case "video-block":
        return (
          <VideoBlock settings={settings} styles={styles} />
        );
      case "contact":
        return (
          <ContactSection settings={settings} styles={styles} />
        );
      default:
        return null;
    }
  };

  return (
    <div key={section.id} className={`responsive-section ${visibilityClasses}`}>
      {renderContent()}
    </div>
  );
};

export default SectionRenderer;
