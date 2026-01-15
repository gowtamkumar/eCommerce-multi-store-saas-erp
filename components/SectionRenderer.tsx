import CTA from "@/components/CTA";
import FAQ from "@/components/FAQ";
import Features from "@/components/Features";
import Hero from "@/components/Hero";
import ProductGrid from "@/components/ProductGrid";
import { stylesToCSS } from "@/lib/page-builder-utils";
import { PageBuilderSection } from "@/types/page-builder";
import React from "react";

interface SectionRendererProps {
  sections: PageBuilderSection[];
}

const SectionRenderer: React.FC<SectionRendererProps> = ({ sections }) => {
  if (!sections || !Array.isArray(sections)) return null;

  return (
    <>
      {sections.map((section, index) => {
        // Ensure section has styles, fallback to undefined
        const { style, className } = stylesToCSS(section.styles || undefined);

        const renderContent = () => {
          switch (section.type) {
            case "hero":
              return (
                <Hero
                  product={section.content?.product}
                  title={section.content?.headline}
                  description={section.content?.subline}
                  isBuilderSection={true}
                />
              );
            case "product-grid":
              return <ProductGrid productIds={section.content?.productIds} isBuilderSection={true} />;
            case "features":
              return <Features product={section.content?.product} isBuilderSection={true} />;
            case "rich-text":
              return (
                <div className="prose dark:prose-invert max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: section.content?.html || '' }} />
                </div>
              );
            case "faq":
              return (
                <FAQ
                  title={section.content?.title}
                  description={section.content?.description}
                  faqs={section.content?.faqs}
                  isBuilderSection={true}
                />
              );
            case "cta":
              return (
                <CTA
                  headline={section.content?.headline}
                  subline={section.content?.subline}
                  buttonLabel={section.content?.buttonLabel}
                  buttonLink={section.content?.buttonLink}
                  isBuilderSection={true}
                />
              );
            default:
              return null;
          }
        };

        return (
          <div key={section.id || index} style={style} className={className}>
            {renderContent()}
          </div>
        );
      })}
    </>
  );
};

export default SectionRenderer;
