import CTA from "@/components/CTA";
import FAQ from "@/components/FAQ";
import Features from "@/components/Features";
import Hero from "@/components/Hero";
import ProductGrid from "@/components/ProductGrid";
import React from "react";

interface SectionRendererProps {
  sections: any[];
}

const SectionRenderer: React.FC<SectionRendererProps> = ({ sections }) => {
  if (!sections || !Array.isArray(sections)) return null;

  return (
    <>
      {sections.map((section, index) => {
        switch (section.type) {
          case "hero":
            return (
              <Hero
                key={index}
                product={section.content?.product}
                title={section.content?.headline}
                description={section.content?.subline}
              />
            );
          case "product-grid":
            // ProductGrid fetches its own data usually, but we might pass settings
            return <ProductGrid key={index} />;
          case "features":
            return <Features key={index} product={section.content?.product} />;
          case "rich-text":
            return (
              <section key={index} className="py-12 bg-white dark:bg-slate-900">
                <div className="container mx-auto px-4 prose dark:prose-invert max-w-4xl">
                  <div dangerouslySetInnerHTML={{ __html: section.content?.html || '' }} />
                </div>
              </section>
            );
          case "faq":
            return (
              <FAQ
                key={index}
                title={section.content?.title}
                description={section.content?.description}
              />
            );
          case "cta":
            return (
              <CTA
                key={index}
                headline={section.content?.headline}
                subline={section.content?.subline}
                buttonLabel={section.content?.buttonLabel}
                buttonLink={section.content?.buttonLink}
              />
            );
          default:
            return null;
        }
      })}
    </>
  );
};

export default SectionRenderer;
