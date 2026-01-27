import { CustomizerSection, FAQItem } from "@/types/customizer";
import { MousePointer2, Plus, Tag } from "lucide-react";
import CategoryGrid from "../store/CategoryGrid";
import ProductSlider from "../store/ProductSlider";
import ReviewSection from "../store/ReviewSection";
import BannerSlider from "../store/BannerSlider";
import OfferBanner from "../store/OfferBanner";
import TextBlock from "../store/TextBlock";
import ImageBlock from "../store/ImageBlock";
import BuilderButton from "../store/BuilderButton";
import FAQSection from "../store/FAQSection";

interface SectionRendererProps {
  sections: CustomizerSection[];
}

const SectionRenderer: React.FC<SectionRendererProps> = ({ sections }) => {
  if (!sections || !Array.isArray(sections)) return null;

  return (
    <>
      {sections.map((section, index) => {
        const settings = section.settings as any;
        const styles = {
          paddingTop: `${section.styles?.paddingTop || 0}px`,
          paddingBottom: `${section.styles?.paddingBottom || 0}px`,
          backgroundColor: section.styles?.backgroundColor,
          color: section.styles?.textColor,
        };

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
                  collectionId={settings?.collectionId}
                  styles={styles}
                />
              );

            case "category-grid":
              return (
                <CategoryGrid
                  title={settings?.title}
                  count={settings?.count}
                  styles={styles}
                />
              );

            case "offer-banner":
              return (
                <OfferBanner buttonText={settings?.buttonText} headline={settings?.headline} subline={settings?.subline} backgroundColor={settings?.backgroundColor} styles={styles} />
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
                <TextBlock alignment={settings?.alignment} html={settings?.html} headline={settings?.headline} styles={styles} />
              );

            case "image-block":
              return (
                <ImageBlock image={settings?.image} headline={settings?.headline} subline={settings?.subline} styles={styles} buttonText={settings?.buttonText} />
              );

            case "button":
              return (
                <BuilderButton variant={settings?.variant} size={settings?.size} text={settings?.text} styles={styles} />
              );

            case "faq-section":
              return (
                <FAQSection items={settings?.items} headline={settings?.headline} subline={settings?.subline} styles={styles} buttonText={settings?.buttonText} />
              );
            default:
              return null;
          }
        };

        return (
          <div key={section.id || index}>
            {renderContent()}
          </div>
        );
      })}
    </>
  );
};

export default SectionRenderer;
