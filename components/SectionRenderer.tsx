import ProductGrid from './ProductGrid';
import CTA from './sections/CTA';
import Hero from './sections/Hero';

interface SectionRendererProps {
  section: {
    id: string;
    type: string;
    content: any;
  };
}

export default function SectionRenderer({ section }: SectionRendererProps) {
  switch (section.type) {
    case 'hero':
      return <Hero content={section.content} />;
    case 'cta':
      return <CTA content={section.content} />;
    case 'products':
      return <ProductGrid />;
    case 'content':
      return (
        <div className="py-12">
          <div
            className="prose prose-lg dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: section.content?.text }}
          />
        </div>
      );
    default:
      return null;
  }
}
