// This is a Server Component that can render both Client and Server sections
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
          default:
            return null;
        }
      })}
    </>
  );
};

export default SectionRenderer;
